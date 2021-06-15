const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter a title'],
        minlength: [4, 'Please enter a bare minimum of 4 characters in title'],
        maxlength: [25, 'Only 25 characters are allowed in title'],
    },
    price: {
        type: Number,
        required: [true, 'Please enter a price'],
        min: [1, 'Price must be positive'],
        // validate: {
        //     validator: function (val) {
        //         console.log(val);
        //         return val > 0;
        //     },
        //     message: 'Price must be greater than 0',
        // },
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
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
