'use strict';

const CODES = require('./codes.json');

class ValidationError {
  constructor (errName, parameter, expected) {
    let error = this.get(errName);
    this.name = errName;
    this.code = error.code;
    this.parameter = parameter;
    this.message = error.message;
    this.render(expected);
  }

  get (chain='') {
    let error = CODES;
    let props = chain.split('.');
    for (let prop of props) if (error && error[prop]) error = error[prop];
    return error || CODES.GENERIC;
  }

  render (expected, template) {
    template = template || this.message;
    this.message = template.replace('${expected}', expected);
  }
}

module.exports = ValidationError;
