'use strict';

let ValidationError = require('../error');

module.exports = {
   multipleOf (subject, param={}, opts) {
    if ((subject % param.multipleOf) !== 0) return new ValidationError('VALUE.MULTIPLE_OF', param);
    else return subject;
  },
  maximum (subject, param={}, opts) {
    if (subject > param.maximum) return new ValidationError('VALUE.MAX', param);
    else return subject;
  },
  exclusiveMaximum (subject, param={}, opts) {
    if (subject >= param.exclusiveMaximum) return new ValidationError('VALUE.EXCLUSIVE_MAX', param);
    else return subject;
  },
  minimum (subject, param={}, opts) {
    if (subject < param.minimum) return new ValidationError('VALUE.MIN', param);
    else return subject;
  },
  exclusiveMinimum (subject, param={}, opts) {
    if (subject <= param.exclusiveMinimum) return new ValidationError('VALUE.EXCLUSIVE_MIN', param);
    else return subject;
  },
};
