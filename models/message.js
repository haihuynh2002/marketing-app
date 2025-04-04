const cuid = require('cuid');
const db = require('../helpers/db');
const { isURL } = require('validator');

module.exports = {
    list,
    get,
    create,
    edit,
    remove
}

const Message = db.model('Message', {
    _id: {type: String, default: cuid},
    user: {
        type: String,
        ref: 'User',
        index: true,
        required: true
    },
    message: String,
    response: String,
    timestamp: { type: Date, default: Date.now }
});

async function list(opts = {}) {
    const {limit = 1, offset = 0} = opts;

    const message = await Message.find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(limit);

    return message;
}

async function get(_id) {
    const message = await Message.findById(_id)
    .populate('user')
    .exec();

    return message;
}

async function create(fields) {
    const message = await new Message(fields).save();
    return message;
}

async function edit(_id, change) {
    const message = await get(_id);
    Object.keys(change).forEach((key) => message[key] = change[key]);
    await message.save();
    return message; 
}

async function remove(_id) {
    await Message.deleteOne({ _id });
}