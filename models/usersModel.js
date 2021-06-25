const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const uniqueValidator = require('mongoose-unique-validator');
const Category = require('./categoriesModel');
const Order = require('./ordersModel');
const Product = require('./productsModel');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
        minLength: [6, 'Minimum of 6 characters are required'],
        maxLength: [25, 'Maximum of 25 characters are allowed'],
        unique: true,
        sparse: true,
        uniqueCaseInsensitive: true,
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // ONLY WORKS ON CREATE AND SAVE
            validator: function (val) {
                return val === this.password;
            },
            message: "Passwords don't match",
        },
    },
    passwordChangedAt: Date,
    role: {
        type: String,
        enum: { values: ['CASHIER', 'MANAGER', 'ADMINISTRATOR'], message: 'Invalid role' },
    },
    isConfirmed: {
        type: Boolean,
        required: [false, 'isConfirm is required'],
        default: false,
    },
    products: { type: [Product.schema], required: true, default: [] },
    categories: { type: [Category.schema], required: true, default: [] },
    orders: { type: [Order.schema], required: true, default: [] },
    createdAt: { type: Date, required: true, default: Date.now() },
});

schema.plugin(uniqueValidator, { message: 'User with the {PATH} of {VALUE} already exists' });

schema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const password = await bcrypt.hash(this.password, 8);

    this.password = password;
    this.passwordConfirm = undefined;

    next();
});

schema.methods.isValidPassword = async function (password, encryptedPassword) {
    const isValid = await bcrypt.compare(password, encryptedPassword);
    return isValid;
};

schema.methods.changedPasswordAfter = function (timestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return timestamp < changedTimestamp;
    }

    // FALSE = PASSWORD NOT CHANGED
    return false;
};

const Model = mongoose.model('User', schema);

module.exports = Model;
