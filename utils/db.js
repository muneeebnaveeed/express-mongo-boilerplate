const mongoose = require('mongoose');

module.exports = class Database {
    constructor() {
        console.log('Created instance of BD');

        this.connectionString = process.env.DB_CONNECTION_STRING;
        this.authString = this.getAuthString(process.env.DB_PASSWORD);
    }

    getAuthString(password) {
        return this.connectionString.replace('<password>', password);
    }

    connect() {
        console.log('Connecting to DB...');
        return mongoose.connect(this.authString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
    }
};
