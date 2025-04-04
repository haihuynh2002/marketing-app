const User = require('../models/user');
const { autoCatch } = require('../helpers/auto-catch');

module.exports = autoCatch({
    createUser,
    getUser,
    getCurrentUser,
    listUsers,
    editUser,
    deleteUser,
})

async function getUser(req, res, next) {
    const user = await User.get(req.params.id);
    const { username, email } = user;
    res.json({ username, email });
}

async function getCurrentUser(req, res, next) {
    const user = await User.get(req.payload.sub);
    const { username, email } = user;
    res.json({ username, email });
}

async function createUser(req, res, next) {
    const user = await User.create(req.body);
    const { username, email } = user;
    res.json({ username, email });
}

async function listUsers(req, res, next) {
    if(!req.isAdmin) return forbidden(next);

    const { offset, limit } = req.query;
    res.json(await User.list({
        offset: Number(offset),
        limit: Number(limit)
    }))
}

async function editUser(req, res) {
    if (!req.isAdmin) return forbidden(next)

    const change  = req.body;
    const product = await User.edit(req.params.id, change);
    res.json(product);
}

async function deleteUser(req, res) {
    if (!req.isAdmin) return forbidden(next)

    const product = await User.remove(req.params.id);
    res.json({ success: true });
}

function forbidden(next) {
    const err = new Error('Forbidden');
    err.statusCode = 403
    next(err)
}