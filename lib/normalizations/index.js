'use strict';

module.exports = {
  trim (subject, param, opts) {
    return subject ? (subject || '').trim() : subject;
  },
  toUpperCase (subject, param, opts) {
    return subject ? (subject || '').toUpperCase() : subject;
  },
  toLowerCase (subject, param, opts) {
    return subject ? (subject || '').toLowerCase() : subject;
  }
};
