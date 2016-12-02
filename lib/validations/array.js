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
  uniqueItems (subject=[], param={}, opts) {
    let map = {};
    for (let val of subject) {
      let key = JSON.stringify(val);
      if (map[key]) return new ValidationError('VALUE.UNIQUE_ITEMS', param);
      else map[key] = true;
    }
    return subject;
  },
};
