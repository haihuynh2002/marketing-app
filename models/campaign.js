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

const Campaign = db.model('Campaign', {
    _id: {type: String, default: cuid},
    name: { type: String, required: true },
    platforms: [String],
    start_date: Date,
    end_date: Date,
    budget: Number,
    ctr: Number,
    conversion_rate: Number
});

async function list(opts = {}) {
    const {limit = 1, offset = 0} = opts;

    const campaign = await Campaign.find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(limit);

    return campaign;
}

async function get(_id) {
    const campaign = await Campaign.findById(_id)
    return campaign;
}

async function create(fields) {
    const campaign = await new Campaign(fields).save();
    return campaign;
}

async function edit(_id, change) {
    const campaign = await get(_id);
    Object.keys(change).forEach((key) => campaign[key] = change[key]);
    await campaign.save();
    return campaign; 
}

async function remove(_id) {
    await Campaign.deleteOne({ _id });
}