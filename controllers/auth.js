const jwt = require('jsonwebtoken')
const passport = require('passport')
const Strategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const { autoCatch } = require('../helpers/auto-catch')
const Users = require('../models/user')

const jwtSecret = process.env.JWT_SECRET || 'mark it zero'
const adminPassword = process.env.ADMIN_PASSWORD || 'iamthewalrus'
const jwtOpts = { algorithm: 'HS256', expiresIn: '30d' }

passport.use(adminStrategy());

const authenticate = passport.authenticate('local', { session: false })

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

async function login(req, res, next) {

  const payload = {
    sub: req.user._id,
    roles: req.user.roles?.join(' ')
  }
  const token = await sign(payload)
  res.cookie('jwt', token, { httpOnly: true })
  res.json({ success: true, token })
}

async function sign(payload) {
    const token = await jwt.sign(payload, jwtSecret, jwtOpts)
    return token
}

async function ensureUser(req, res, next) {
  const jwtString = req.headers.auhorization || req.cookies.jwt
  const payload = await verify(jwtString);

  if(payload) {
    req.payload = payload;
    if(payload.roles.includes('admin')) req.isAdmin = true;
    return next();
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

module.exports = autoCatch({
    authenticate,
    login,
    ensureUser,
  });
