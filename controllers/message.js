const Message = require('../models/message');
const { autoCatch } = require('../helpers/auto-catch');

module.exports = autoCatch({
    createMessage,
    getMessage,
    listMessages,
    editMessage,
    deleteMessage,
})

async function listMessages(req, res) {
    const {offset = 0, limit = 1, user = req.payload.sub} = req.query;
    res.json(await Message.list({
        offset: Number(offset),
        limit: Number(limit),
        user
    }));
}

async function getMessage(req, res, next) {
    const { id } = req.params;
    const message = await Message.get(id);
    if(!message) return next();

    res.json(message);
}

async function createMessage(req, res, next) {
    const fields = {
        ...req.body,
        user: req.payload.sub
    }
    const message = await Message.create(fields);
    res.json(message);
}

async function editMessage(req, res) {
    const change  = req.body;
    const message = await Message.edit(req.params.id, change);
    res.json(message);
}

async function deleteMessage(req, res) {
    const message = await Message.remove(req.params.id);
    res.json({ success: true });
}