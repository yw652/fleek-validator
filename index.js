'use strict';

module.exports = require('./lib/middleware');

let validator = new Validator();
module.exports._validator = validator;
module.exprts.ctx = validator.ctx;
module.exports.object = validator.object;
module.exports.one = validator.one;
