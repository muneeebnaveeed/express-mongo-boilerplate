const express = require('express');
const dotenv = require('dotenv');
const Database = require('./db');
const productsRoute = require('./routes/products');
const AppError = require('./utils/AppError');
const ErrorController = require('./controllers/errors');

const app = express();

dotenv.config();

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);

    app.use(express.json());

    app.use('/products', productsRoute);

    app.use('*', (req, res, next) => next(new AppError(`Cannot find ${req.originalUrl} on the server!`, 404)));

    app.use(ErrorController);

    new Database().connect().then(() => console.log('Connected to DB'));
});
