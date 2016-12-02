'use strict';

const is = require('is');
const moment = require('moment');

let ValidationError = require('../error');

module.exports = {
  maxItems (subject, param={}, opts) {
    if (subject.length > param.maxItems) return new ValidationError('VALUE.MAX_ITEMS', param);
    else return subject;
  },
  minItems (subject, param={}, opts) {
    if (subject.length < param.minItems) return new ValidationError('VALUE.MIN_ITEMS', param);
    else return subject;
  },
};
