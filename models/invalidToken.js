const cuid = require('cuid');
const db = require('../helpers/db');

module.exports = {
    list,
    get,
    getByToken,
    create,
    edit,
    remove
}

const InvalidToken = db.model('InvalidToken', {
    _id: {type: String, default: cuid},
    token: String,
    exp: Date
});

async function list(opts = {}) {
    const {limit = 1, offset = 0} = opts;

    const invalidToken = await InvalidToken.find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(limit);

    return invalidToken;
}

async function get(_id) {
    const invalidToken = await InvalidToken.findById(_id)
    return invalidToken;
}

async function getByToken(token) {
    const invalidToken = await InvalidToken.findOne({ token })
    return invalidToken;
}

async function create(fields) {
    const invalidToken = await new InvalidToken(fields).save();
    return invalidToken;
}

async function edit(_id, change) {
    const invalidToken = await get(_id);
    Object.keys(change).forEach((key) => invalidToken[key] = change[key]);
    await invalidToken.save();
    return invalidToken; 
}

async function remove(_id) {
    await InvalidToken.deleteOne({ _id });
}