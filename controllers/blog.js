const Blog = require('../models/blog');
const { autoCatch } = require('../helpers/auto-catch');

module.exports = autoCatch({
    createBlog,
    getBlog,
    listBlogs,
    editBlog,
    deleteBlog,
})

async function listBlogs(req, res) {
    const {offset = 0, limit = 1, tag} = req.query;
    res.json(await Blog.list({
        offset: Number(offset),
        limit: Number(limit),
        tag
    }));
}

async function getBlog(req, res, next) {
    const { id } = req.params;
    const blog = await Blog.get(id);
    if(!blog) return next();

    res.json(blog);
}

async function createBlog(req, res, next) {
    if(!req.isAdmin) return forbidden(next);

    const blog = await Blog.create(req.body);
    res.json(blog);
}

async function editBlog(req, res) {
    if (!req.isAdmin) return forbidden(next)

    const change  = req.body;
    const blog = await Blog.edit(req.params.id, change);
    res.json(blog);
}

async function deleteBlog(req, res) {
    if (!req.isAdmin) return forbidden(next)

    const blog = await Blog.remove(req.params.id);
    res.json({ success: true });
}

function forbidden(next) {
    const err = new Error('Forbidden');
    err.statusCode = 403
    next(err)
}