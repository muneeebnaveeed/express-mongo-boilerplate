const mongoose = require('mongoose');
const _ = require('lodash');
const Product = require('../models/products');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

module.exports.getProducts = catchAsync(async function (req, res, next) {
    const products = await Product.find().select('-__v');
    res.status(200).json({
        status: 'success',
        data: products,
    });
});

module.exports.getProductById = catchAsync(async function (req, res, next) {
    const productId = req.params.id;

    if (!mongoose.isValidObjectId(productId)) return next(new AppError('Please enter a valid Product Id', 400));

    const product = await Product.findById(productId).select('-_id -__v');

    res.status(200).json({
        status: 'success',
        data: product,
    });
});

module.exports.addBulkProducts = catchAsync(async function (req, res, next) {
    const products = req.body;

    if (!products || !products.length) return next(new AppError('Please enter valid products', 400));

    await Product.insertMany(products);

    res.status(200).json();
});

module.exports.addProduct = catchAsync(async function (req, res, next) {
    const newProduct = _.pick(req.body, ['title', 'price']);

    const createdProduct = new Product(newProduct);

    await createdProduct.save();

    res.status(200).json(createdProduct);
});

module.exports.editProduct = catchAsync(async function (req, res, next) {
    const productId = req.params.id;

    if (!mongoose.isValidObjectId(productId)) return next(new AppError('Please enter a valid Product Id', 400));

    const newProduct = _.pick(req.body, ['title', 'price']);

    if (!Object.keys(newProduct).length) return next(new AppError('Please enter a valid product', 400));

    const product = await Product.findById(productId).select('-__v');

    if (product.title === newProduct.title || product.price === newProduct.price)
        return next(new AppError('Please enter an updated product', 400));

    Object.entries(newProduct).forEach((arr) => {
        const [key, value] = arr;
        product[key] = value;
    });

    await product.save();

    res.status(200).json(product);
});

module.exports.deleteProducts = catchAsync(async function (req, res, next) {
    let productIds = req.body;

    for (const id of productIds) {
        if (!mongoose.isValidObjectId(id)) return next(new AppError('Please enter valid Product Ids', 400));
    }

    productIds = productIds.map((id) => mongoose.Types.ObjectId(id));

    await Product.deleteMany({
        _id: {
            $in: productIds,
        },
    });

    res.status(200).json();
});

module.exports.deleteProductById = catchAsync(async function (req, res, next) {
    const productId = req.params.id;

    if (!mongoose.isValidObjectId(productId)) return next(new AppError('Please enter a valid Product Id', 400));

    await Product.deleteOne({ _id: productId });

    res.status(200).json();
});
