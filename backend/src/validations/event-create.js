var Joi = require('joi');

module.exports = {
    body: {
        code: Joi.string().required(),
        from: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
        to: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
    }
};
