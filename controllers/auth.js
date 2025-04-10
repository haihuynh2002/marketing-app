const jwt = require('jsonwebtoken')
const passport = require('passport')
const Strategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require("bcrypt");
const axios = require("axios");

const { autoCatch } = require('../helpers/auto-catch')
const Users = require('../models/user');
const InvalidToken = require('../models/invalidToken');
const ROLES = require('../helpers/roles');

const jwtSecret = process.env.JWT_SECRET || 'secret'
const adminPassword = process.env.ADMIN_PASSWORD || '12345678'
const jwtOpts = { algorithm: 'HS256', expiresIn: '30d' }

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:1337/auth/google/callback';

passport.use(adminStrategy());
passport.use(googleStrategy());

const authenticate = passport.authenticate('local', { session: false })
const authenticateGoogle = passport.authenticate('google', { 
  session: false,
  scope: ['profile', 'email'] 
});

function adminStrategy() {
  return new Strategy(async function (username, password, cb) {

    try {
        const user = await Users.getByUsername(username);
        if(!user) return cb(null, false);

        const isUser = await bcrypt.compare(password, user.password);
        if(isUser) return cb(null, user)
    } catch(err) {
       console.log(err);
    }

    cb(null, false)
  });
}

function googleStrategy() {
  return new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: googleCallbackURL,
    passReqToCallback: true
  }, 
  async (req, accessToken, refreshToken, profile, cb) => {
    try {
      let user = await Users.getByEmail(profile.emails[0].value);
      
      if (!user) {
        const newUser = {
          email: profile.emails[0].value,
          username: profile.emails[0].value.split('@')[0]
        };
        
        user = await Users.create(newUser);
      }
      
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  });
}

async function login(req, res, next) {

  const payload = {
    sub: req.user._id,
    roles: req.user.roles?.join(' ')
  }
  const token = await sign(payload)
  res.cookie('jwt', token, { httpOnly: true })
  res.json({ success: true, token })
}

async function loginGoogle(req, res, next) {
  const payload = {
    sub: req.user._id,
    roles: req.user.roles?.join(' ')
  }
  const token = await sign(payload)
  
  res.cookie('jwt', token, { httpOnly: true })
  
  res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
}

async function sign(payload) {
    const token = await jwt.sign(payload, jwtSecret, jwtOpts)
    return token
}

async function ensureUser(req, res, next) {
  const jwtString = req.headers.auhorization || req.cookies.jwt

  if(!await InvalidToken.getByToken(jwtString)) {
    const payload = await verify(jwtString);

    if(payload) {
      req.payload = payload;
      if(payload.roles.includes(ROLES.ADMIN)) req.isAdmin = true;
      return next();
    }
  }

  const err = new Error("Unauthorized");
  err.statusCode = 401;
  next(err);
}

async function verify(jwtString = '') {
    jwtString = jwtString.replace(/^Bearer /i, '');

    try {
        const payload = await jwt.verify(jwtString, jwtSecret);
        return payload;
    } catch(err) {
        err.statusCode = 401
        throw err
    }
}

async function logout(req, res, next) {
  const jwtString = req.headers.auhorization || req.cookies.jwt
  const payload = await verify(jwtString);

  if(payload) {
    const fields = {
      token: jwtString,
      exp: payload.exp,
    }
    await InvalidToken.create(fields);

    res.json({ success: true });
  }
}

function getGoogleAuthUrl(req, res) {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${googleClientId}&` +
    `redirect_uri=${googleCallbackURL}&` +
    `response_type=code&` +
    `scope=openid%20profile%20email&` +
    `access_type=offline&` + 
    `prompt=consent`;
  res.json({ url });
}

module.exports = autoCatch({
    authenticate,
    login,
    logout,
    ensureUser,
    authenticateGoogle,
    getGoogleAuthUrl,
    loginGoogle
});
