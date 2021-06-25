const { promisify } = require('util');
const _ = require('lodash');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { signToken } = require('../utils/jwt');
const User = require('../models/usersModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

module.exports.getUsers = catchAsync(async function (req, res, next) {
    const users = await User.find().select('_id name role');
    res.status(200).json(users);
});

module.exports.getPendingUsers = catchAsync(async function (req, res, next) {
    const pendingUsers = await User.find({ isConfirmed: false }).select('_id name role');
    res.status(200).json(pendingUsers);
});

module.exports.registerUser = catchAsync(async function (req, res, next) {
    const newUser = _.pick(req.body, ['name', 'password', 'passwordConfirm']);

    if (!Object.keys(newUser).length) return next(new AppError('Please enter a valid user', 400));

    const createdUser = await User.create(newUser);

    const token = signToken(createdUser._id);

    const filteredUser = _.pick(createdUser, ['_id', 'name', 'role']);

    res.status(200).json({ ...filteredUser, token });
});

module.exports.loginUser = catchAsync(async function (req, res, next) {
    const body = _.pick(req.body, ['name', 'password']);

    if (Object.keys(body).length < 2) return next(new AppError('Please enter email and password', 400));

    const user = await User.findOne({ name: body.name });

    if (!user) return next(new AppError('Invalid username or password', 401));

    const isValidPassword = await user.isValidPassword(body.password, user.password);

    if (!isValidPassword) return next(new AppError('Invalid username or password', 401));

    if (!user.isConfirmed) return next(new AppError('Your access is pending', 403));

    const token = signToken(user._id);

    res.status(200).json(token);
});

module.exports.protect = catchAsync(async function (req, res, next) {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
        // eslint-disable-next-line prefer-destructuring
        token = req.headers.authorization.split(' ')[1];

    if (!token) return next(new AppError('Please login to get access', 401));

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const freshUser = await User.findById(decoded.id);

    if (!freshUser) return next(new AppError('Please login again', 401));

    const hasChangedPassword = freshUser.changedPasswordAfter(decoded.iat);
    if (hasChangedPassword) return next(new AppError('Please login again', 401));

    const { isConfirmed } = freshUser;

    if (!isConfirmed) return next(new AppError('Your access is pending', 403));

    res.locals.user = freshUser;

    next();
});

module.exports.allowAccess = (...roles) =>
    async function (req, res, next) {
        if (!roles.includes(req.user.role)) return next(new AppError('Unauthorized access to this route', 403));
        next();
    };

module.exports.confirmUser = catchAsync(async function (req, res, next) {
    const { id: userId, role } = req.params;

    if (!mongoose.isValidObjectId(userId)) return next(new AppError('Please enter a valid id', 400));

    const user = await User.findById(userId);

    if (!user) return next(new AppError('User does not exist', 404));

    await user.updateOne({ isConfirmed: true, role: role.toUpperCase() });

    res.status(200).json(_.pick(user, ['_id', 'name', 'role', 'createdAt']));
});

module.exports.authorizeUser = catchAsync(async function (req, res, next) {
    const { id: userId, role } = req.params;

    if (!mongoose.isValidObjectId(userId)) return next(new AppError('Please enter a valid id', 400));

    const user = await User.findById(userId);

    if (!user) return next(new AppError('User does not exist', 404));

    await user.update({ role: role.toUpperCase() }, { runValidators: true });

    res.status(200).json();
});
