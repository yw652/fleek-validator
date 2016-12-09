'use strict';

let Validator = require('./lib/validator');

module.exports = require('./lib/middleware');

let validator = new Validator();
module.exports._validator = validator;
module.exports.ctx = validator.ctx;
module.exports.object = validator.object;
module.exports.one = validator.one;
