'use strict'
var env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env]

module.exports = (type) => {
    return config.errCode[type]
}
