const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Product = require('./products');

const categoriesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter a title'],
        minlength: [4, 'Please enter a bare minimum of 4 characters in title'],
        maxlength: [25, 'Only 25 characters are allowed in title'],
        unique: true,
    },
    products: { type: [Product.schema], required: true, default: [] },
});

categoriesSchema.plugin(uniqueValidator);

categoriesSchema.statics.deleteCategory = async function (categoryId) {
    await Product.remove({ category: categoryId });
    await this.findByIdAndDelete(categoryId);
};

const Category = mongoose.model('Category', categoriesSchema);

module.exports = Category;
