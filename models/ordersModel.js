const mongoose = require('mongoose');

const ordersSchema = new mongoose.Schema({
    total: Number,
    products: { type: Array, required: [true, 'Please enter products'] },
    createdAt: { type: Date, required: true, default: Date.now() },
});

const Order = mongoose.model('Order', ordersSchema);

module.exports = Order;
