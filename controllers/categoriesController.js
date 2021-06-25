const mongoose = require('mongoose');
const _ = require('lodash');
const Category = require('../models/categoriesModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

module.exports.getCategories = catchAsync(async function (req, res, next) {
    const categories = await Category.find().select('-__v');
    res.status(200).json(categories);
});

module.exports.getCategory = catchAsync(async function (req, res, next) {
    const categoryId = req.params.id;

    if (!mongoose.isValidObjectId(categoryId)) return next(new AppError('Please enter a valid id', 400));

    const category = await Category.findById(categoryId).select('-_id -__v');

    if (!category) return next(new AppError('Category does not exist', 400));

    res.status(200).json(category);
});

module.exports.addCategory = catchAsync(async function (req, res, next) {
    const newCategory = _.pick(req.body, ['title']);

    if (!Object.keys(newCategory).length) return next(new AppError('Please enter a valid category', 400));

    const createdCategory = await Category.create(newCategory);

    res.status(200).json(createdCategory);
});

module.exports.editCategory = catchAsync(async function (req, res, next) {
    const categoryId = req.params.id;

    if (!mongoose.isValidObjectId(categoryId)) return next(new AppError('Please enter a valid id', 400));

    const newCategory = _.pick(req.body, ['title']);

    if (!Object.keys(newCategory).length) return next(new AppError('Please enter a valid category', 400));

    const category = await Category.findById(categoryId).select('-__v');

    if (category.title === newCategory.title) return next(new AppError('Please enter an category', 400));

    Object.entries(newCategory).forEach((arr) => {
        const [key, value] = arr;
        category[key] = value;
    });

    await category.save();

    res.status(200).json(category);
});

async function handleDeleteCategories(ids) {
    let categoryIds = ids;

    for (const id of categoryIds) {
        if (!mongoose.isValidObjectId(id)) throw new AppError('Please enter valid ids', 400);
    }

    categoryIds = categoryIds.map((id) => mongoose.Types.ObjectId(id));

    await Category.deleteCategories(categoryIds);
}

module.exports.deleteCategories = catchAsync(async function (req, res, next) {
    const categoryIds = req.body;

    await handleDeleteCategories(categoryIds)
        .then(() => res.status(200).json())
        .catch((err) => next(err));
});

module.exports.deleteCategory = catchAsync(async function (req, res, next) {
    const categoryIds = req.params.id.split(',');

    await handleDeleteCategories(categoryIds)
        .then(() => res.status(200).json())
        .catch((err) => next(err));
});
