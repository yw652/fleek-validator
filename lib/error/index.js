'use strict';

const CODES = require('./codes.json');

class ValidationError {
  constructor (errName, parameter, expected) {
    let error = this.get(errName);
    this.name = errName;
    this.code = error.code;
    this.parameter = parameter;
    this.template = error.message;
    this.expected = expected
    this.render();
  }

  get (chain='') {
    let error = CODES;
    let props = chain.split('.');
    for (let prop of props) if (error && error[prop]) error = error[prop];
    return error || CODES.GENERIC;
  }

  render (expected) {
    this.expected = expected || this.expected;
    this.message = this.template.replace('${expected}', expected);
  }
}

module.exports = ValidationError;
