var Boom = require('@hapi/boom');

function send(res, boomError) {
    return res.status(boomError.output.statusCode).send(boomError.output.payload);
}

module.exports = function boomAdapter() {
    return function (req, res, next) {
        res.boom = {
            badRequest: function (message) {
                return send(res, Boom.badRequest(message));
            },
            unauthorized: function (message) {
                return send(res, Boom.unauthorized(message));
            },
            notFound: function (message) {
                return send(res, Boom.notFound(message));
            },
            conflict: function (message) {
                return send(res, Boom.conflict(message));
            },
            badImplementation: function (message) {
                return send(res, Boom.badImplementation(message));
            },
            badData: function (message) {
                return send(res, Boom.badData(message));
            }
        };

        next();
    };
};