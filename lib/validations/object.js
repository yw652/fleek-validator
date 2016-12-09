'use strict';

const moment = require('moment');

let ValidationError = require('../error');

module.exports = {
  maxProperties (subject={}, param={}, opts) {
    let count = Object.keys(subject).length;
    if (count > param.maxProperties) return new ValidationError('VALUE.MAX_ITEMS', param);
    else return subject;
  },
  minProperties (subject, param={}, opts) {
    let count = Object.keys(subject).length;
    if (count < param.minProperties) return new ValidationError('VALUE.MIN_ITEMS', param);
    else return subject;
  },
};
