const mongoose = require('mongoose');
const _ = require('lodash');
const Product = require('../models/products');
const Category = require('../models/categories');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

module.exports.getProducts = catchAsync(async function (req, res, next) {
    const products = await Product.find()
        .populate({
            path: 'category',
            select: { products: 0, __v: 0 },
        })
        .select('-__v');

    res.status(200).json(products);
});

module.exports.getProduct = catchAsync(async function (req, res, next) {
    const productId = req.params.id;

    if (!mongoose.isValidObjectId(productId)) return next(new AppError('Please enter a valid id', 400));

    const product = await Product.findById(productId)
        .populate({
            path: 'category',
            select: { products: 0, __v: 0 },
        })
        .select('-_id -__v');

    if (!product) return next(new AppError('Product does not exist', 400));

    res.status(200).json(product);
});

module.exports.addProducts = catchAsync(async function (req, res, next) {
    const products = req.body;

    if (!products || !products.length) return next(new AppError('Please enter valid products', 400));

    await Product.insertMany(products);

    res.status(200).json();
});

module.exports.addProduct = catchAsync(async function (req, res, next) {
    const newProduct = _.pick(req.body, ['title', 'price', 'category']);

    const { category: categoryId } = newProduct;

    if (categoryId) {
        if (!mongoose.isValidObjectId(categoryId)) return next(new AppError('Please enter a valid id', 400));

        const category = await Category.findById(categoryId);

        if (!category) return next(new AppError('Category does not exist', 400));
    }

    const createdProduct = new Product(newProduct);

    // IMPORTANT
    // PUSHES PRODUCT TO THE CORRESPONDING CATEGORY'S PRODUCTS ARRAY
    // MIDDLEWARE ON 'save'
    await createdProduct.save();

    const product = await Product.findById(createdProduct._id)
        .populate('category', { _id: 1, title: 1 })
        .select('-__v');

    res.status(200).json(product);
});

module.exports.editProduct = catchAsync(async function (req, res, next) {
    const productId = req.params.id;

    if (!mongoose.isValidObjectId(productId)) return next(new AppError('Please enter a valid id', 400));

    const newProduct = _.pick(req.body, ['title', 'price', 'category']);

    if (!Object.keys(newProduct).length) return next(new AppError('Please enter a valid product', 400));

    const product = await Product.editProduct(productId, newProduct);

    res.status(200).json(product);
});

module.exports.deleteProducts = catchAsync(async function (req, res, next) {
    let productIds = req.body;

    for (const id of productIds) {
        if (!mongoose.isValidObjectId(id)) return next(new AppError('Please enter valid ids', 400));
    }

    productIds = productIds.map((id) => mongoose.Types.ObjectId(id));

    await Product.deleteProducts(productIds);

    res.status(200).json();
});

module.exports.deleteProduct = catchAsync(async function (req, res, next) {
    const productId = req.params.id;

    if (!mongoose.isValidObjectId(productId)) return next(new AppError('Please enter a valid id', 400));

    const product = await Product.findById(productId);

    if (!product) return next(new AppError('Product does not exist', 400));

    await Product.deleteProduct(product);

    res.status(200).json();
});
