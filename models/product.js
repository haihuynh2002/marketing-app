const cuid = require('cuid');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const db = require('../helpers/db');
const { isURL } = require('validator');

module.exports = {
    list,
    get,
    create,
    edit,
    remove
}

const Product = db.model('Product', {
    _id: {type: String, default: cuid},
    name: { type: String, required: true },
    description: {type: String, required: true},
    price: { type: Number, required: true },
    images: { type: [String], required: true }
});

async function list(opts = {}) {
    const {limit = 1, offset = 0} = opts;

    const products = await Product.find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(limit);

    return products;
}

async function get(_id) {
    const product = await Product.findById(_id)
    return product;
}

async function create(fields, files) {
    const product = await new Product(fields).save();
    product.images = await saveImages({ id: product._id, files });

    await product.save();
    return product;
}

async function saveImages({ id, files }) {
    try {
        if (files && files.images) {
          const images = Array.isArray(files.images) ? files.images : [files.images];
          const uploadDir = path.join(__dirname, '../public/uploads/products');
          
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
    
          return await Promise.all(
            images.map(async (image, index) => {
              const filename = `${id}-${Date.now()}-${index}`;
              
              const originalPath = path.join(uploadDir, `${filename}.webp`);
              await sharp(image.data)
                .resize(1200)
                .webp({ quality: 80 })
                .toFile(originalPath);
    

                console.log(`/uploads/products/${filename}.webp`);
              return `/uploads/products/${filename}.webp`;
            })
          )
        }

    } catch(err) {
        console.log(err);
    }

    return [];
}

async function edit(_id, change) {
    const product = await get(_id);
    Object.keys(change).forEach((key) => product[key] = change[key]);
    await product.save();
    return product; 
}

async function remove(_id) {
    await Product.deleteOne({ _id });
}