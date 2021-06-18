const mongoose = require('mongoose');
const _ = require('lodash');
const Category = require('./categories');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter a title'],
        unique: true,
        minlength: [4, 'Please enter a bare minimum of 4 characters in title'],
        maxlength: [25, 'Only 25 characters are allowed in title'],
    },
    price: {
        type: Number,
        required: [true, 'Please enter a price'],
        min: [1, 'Price must be positive'],
    },
    discountedPrice: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price;
            },
            message: 'Discounted Price should be lower than original price',
        },
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'Category',
    },
});

productSchema.post('save', async (product, next) => {
    const { category: categoryId } = product;
    const filteredProduct = _.pick(product, ['_id', 'title', 'price']);

    await Category.updateOne({ _id: categoryId }, { $push: { products: filteredProduct } });

    next();
});

productSchema.statics.deleteProducts = async function (productIds) {
    // 1. DELETE PRODUCT DOCUMENTS
    await this.deleteMany({
        _id: {
            $in: productIds,
        },
    });

    // 2. DELETE PRODUCTS EMBEDDED IN COLLECTIONS
    await Category.updateMany({}, { $pull: { products: { _id: { $in: productIds } } } });
};

productSchema.statics.deleteProduct = async function (product) {
    const { category: categoryId, _id: productId } = product;

    // 1. DELETE PRODUCt
    await this.deleteOne({ _id: productId });

    // 2. REMOVE PRODUCT FROM IT'S COLLECTION
    if (categoryId) await Category.updateMany({ _id: categoryId }, { $pull: { products: { _id: productId } } });
};

productSchema.statics.editProduct = async function (productId, newProduct) {
    // 1. FIND PRODUCT BY ID AND UPDATE

    const product = await this.findById(productId);

    const { category: categoryId } = product;

    const loopOverNewProduct = (cb) =>
        Object.entries(newProduct).forEach((el) => {
            const [key, value] = el;
            cb(key, value);
        });

    let updatedProduct = null;

    if (!categoryId) {
        loopOverNewProduct((key, value) => (product[key] = value));

        // IMPORTANT: TRIGGERS SAVE MIDDLEWARE
        updatedProduct = await product.save();
    } else {
        const setQuery = {};

        loopOverNewProduct((key, value) => (setQuery[`products.$.${key}`] = value));

        const p = await this.findByIdAndUpdate(productId, newProduct).select('-__v');

        updatedProduct = {
            ...p._doc,
            ...newProduct,
        };

        await Category.updateOne(
            { _id: categoryId, 'products._id': mongoose.Types.ObjectId(productId) },
            { $set: setQuery }
        );
    }

    return updatedProduct;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
