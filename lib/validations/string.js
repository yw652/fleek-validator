'use strict';

const is = require('is_js');

let ValidationError = require('../error');

module.exports = {
  email (subject, param={}, opts) {
    if (is.not.email(subject)) return new ValidationError('VALUE.EMAIL', param);
    else return subject;
  },
  alphanumeric (subject, param={}, opts) {
    if (is.not.alphaNumeric(subject)) return new ValidationError('VALUE.ALPHANUMERIC', param);
    else return subject;
  },
  lowercase (subject, param={}, opts) {
    if (is.not.lowerCase(subject)) return new ValidationError('VALUE.LOWERCASE', param);
    else return subject;
  },
  uppercase (subject, param={}, opts) {
    if (is.not.upperCase(subject)) return new ValidationError('VALUE.UPPERCASE', param);
    else return subject;
  },
  minLength (subject, param={}, opts) {
    if (subject.length < param.minLength) return new ValidationError('VALUE.MIN_LENGTH', param);
    else return subject;
  },
  maxLength (subject, param={}, opts) {
    if (subject.length > param.maxLength) return new ValidationError('VALUE.MAX_LENGTH', param);
    else return subject;
  },
  pattern (subject, param={}, opts) {
    let pattern = (param.pattern || '');
    let regex = new RegExp(pattern);
    if (!regex.test(subject)) return new ValidationError('VALUE.PATTERN', param, pattern);
    else return subject;
  }
};
