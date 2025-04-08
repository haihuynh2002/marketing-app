const Product = require('../models/product');

const { autoCatch } = require('../helpers/auto-catch');

module.exports = autoCatch({
    createProduct,
    getProduct,
    listProducts,
    editProduct,
    deleteProduct,
})

async function listProducts(req, res) {
    const {offset = 0, limit = 1} = req.query;
    res.json(await Product.list({
        offset: Number(offset),
        limit: Number(limit)
    }));
}

async function getProduct(req, res, next) {
    const { id } = req.params;
    const product = await Product.get(id);
    if(!product) return next();

    res.json(product);
}

async function createProduct(req, res, next) {
    if(!req.isAdmin) return forbidden(next);

    const product = await Product.create(req.body, req.files);
    res.json(product);
}

async function editProduct(req, res) {
    if (!req.isAdmin) return forbidden(next)

    const change  = req.body;
    const product = await Product.edit(req.params.id, change);
    res.json(product);
}

async function deleteProduct(req, res) {
    if (!req.isAdmin) return forbidden(next)

    const product = await Product.remove(req.params.id);
    res.json({ success: true });
}

function forbidden(next) {
    const err = new Error('Forbidden');
    err.statusCode = 403
    next(err)
}