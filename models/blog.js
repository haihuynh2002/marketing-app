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

const Blog = db.model('Blog', {
    _id: {type: String, default: cuid},
    title: String,
    content: String,
    author: {
        type: String,
        ref: 'User',
        index: true,
        required: true
    },
    createdAt: { type: Date, default: Date.now }
});

async function list(opts = {}) {
    const {limit = 1, offset = 0} = opts;

    const blog = await Blog.find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(limit);

    return blog;
}

async function get(_id) {
    const blog = await Blog.findById(_id)
    return blog;
}

async function create(fields) {
    const blog = await new Blog(fields).save();
    return blog;
}

async function edit(_id, change) {
    const blog = await get(_id);
    Object.keys(change).forEach((key) => blog[key] = change[key]);
    await blog.save();
    return blog; 
}

async function remove(_id) {
    await Blog.deleteOne({ _id });
}