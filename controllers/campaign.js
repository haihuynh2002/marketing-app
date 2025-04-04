const Campaign = require('../models/campaign');
const { autoCatch } = require('../helpers/auto-catch');

module.exports = autoCatch({
    createCampaign,
    getCampaign,
    listCampaigns,
    editCampaign,
    deleteCampaign,
})

async function listCampaigns(req, res) {
    const {offset = 0, limit = 1, tag} = req.query;
    res.json(await Campaign.list({
        offset: Number(offset),
        limit: Number(limit),
        tag
    }));
}

async function getCampaign(req, res, next) {
    const { id } = req.params;
    const campaign = await Campaign.get(id);
    if(!campaign) return next();

    res.json(campaign);
}

async function createCampaign(req, res, next) {
    if(!req.isAdmin) return forbidden(next);

    const campaign = await Campaign.create(req.body);
    res.json(campaign);
}

async function editCampaign(req, res) {
    if (!req.isAdmin) return forbidden(next)

    const change  = req.body;
    const campaign = await Campaign.edit(req.params.id, change);
    res.json(campaign);
}

async function deleteCampaign(req, res) {
    if (!req.isAdmin) return forbidden(next)

    const campaign = await Campaign.remove(req.params.id);
    res.json({ success: true });
}

function forbidden(next) {
    const err = new Error('Forbidden');
    err.statusCode = 403
    next(err)
}