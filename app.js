const express = require('express');
const dotenv = require('dotenv');

const Database = require('./utils/db');
const AppError = require('./utils/AppError');
const ErrorController = require('./utils/errorController');

const productsRoute = require('./routes/productsRoute');
const categoriesRoute = require('./routes/categoriesRoute');
const ordersRoute = require('./routes/ordersRoute');
const authRoute = require('./routes/authRoute');
const { protect } = require('./controllers/authController');

const app = express();

dotenv.config();

const port = process.env.PORT || 5500;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);

    app.use(express.json());

    app.use('/products', protect, productsRoute);
    app.use('/categories', protect, categoriesRoute);
    app.use('/orders', protect, ordersRoute);
    app.use('/auth', authRoute);

    app.use('*', (req, res, next) => next(new AppError(`Cannot find ${req.originalUrl} on the server!`, 404)));

    app.use(ErrorController);

    new Database().connect().then(() => console.log('Connected to DB'));
});
