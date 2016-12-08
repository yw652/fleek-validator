'use strict';

const is = require('is_js');

let Validator = require('./validator')

module.exports = (opts={ throw: true, catch: false }) => {
  let validator = new Validator(opts);
  let middleware = (ctx, next) => {
    validator.ctx(ctx);
    let result = ctx.fleek.validation;
    if (result.failed) {
      if (opts.catch) {
        return opts.catch(ctx, next);
      } else if (opts.throw) {
        let err = new Error('Validation failed');
        err.errors = result.errors;
        return Promise.reject(err);
      }
    }
    return next();
  };

  middleware.catch = (func) => {
    if (is.function(func)) opts.catch = func;
    return middleware;
  }
  return middleware;
};
