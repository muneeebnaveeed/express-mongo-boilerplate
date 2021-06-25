const mongoose = require('mongoose');
const _ = require('lodash');
const Order = require('../models/ordersModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

module.exports.getOrders = catchAsync(async function (req, res, next) {
    const orders = await Order.find().select('-__v');
    res.status(200).json(orders);
});

module.exports.getOrder = catchAsync(async function (req, res, next) {
    const orderId = req.params.id;

    if (!mongoose.isValidObjectId(orderId)) return next(new AppError('Please enter a valid id', 400));

    const order = await Order.findById(orderId).select('-_id -__v');

    if (!order) return next(new AppError('Order does not exist', 400));

    res.status(200).json(order);
});

module.exports.addOrder = catchAsync(async function (req, res, next) {
    const newOrder = _.pick(req.body, ['products']);

    if (!Object.keys(newOrder).length) return next(new AppError('Please enter a valid order', 400));

    newOrder.total = newOrder.products.map((product) => product.price).reduce((a, b) => a + b);

    const createdOrder = await Order.create(newOrder);

    res.status(200).json(createdOrder);
});

async function handleDeleteOrders(ids) {
    let orderIds = ids;

    for (const id of orderIds) {
        if (!mongoose.isValidObjectId(id)) throw new AppError('Please enter valid ids', 400);
    }

    orderIds = orderIds.map((id) => mongoose.Types.ObjectId(id));

    await Order.deleteMany({ _id: { $in: orderIds } });
}

module.exports.deleteOrders = catchAsync(async function (req, res, next) {
    const orderIds = req.body;

    await handleDeleteOrders(orderIds)
        .then(() => res.status(200).json())
        .catch((err) => next(err));
});

module.exports.deleteOrder = catchAsync(async function (req, res, next) {
    const orderIds = req.params.id.split(',');

    await handleDeleteOrders(orderIds)
        .then(() => res.status(200).json())
        .catch((err) => next(err));
});
