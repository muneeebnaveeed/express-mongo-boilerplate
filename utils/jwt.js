const jwt = require('jsonwebtoken');

module.exports.signToken = function (id) {
    const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

    const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return token;
};
