const mongoose = require('mongoose');
const Product = require('./productsModel');

const categoriesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter a title'],
        minlength: [4, 'Please enter a bare minimum of 4 characters in title'],
        maxlength: [25, 'Only 25 characters are allowed in title'],
        sparse: true,
    },
    products: { type: [Product.schema], required: true, default: [] },
    createdAt: { type: Date, required: true, default: Date.now() },
});

categoriesSchema.statics.deleteCategories = async function (categoryIds) {
    // IMPORTANT, AS THE MODELS ARE CROSS REFERENCED
    const productsModel = mongoose.model('Product');

    await productsModel.deleteMany({ category: { $in: categoryIds } });

    await this.deleteMany({ _id: { $in: categoryIds } });
};

const Category = mongoose.model('Category', categoriesSchema);

module.exports = Category;
