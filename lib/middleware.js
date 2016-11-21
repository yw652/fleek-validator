'use strict';

module.exports = (swagger={}, opts={}) => {
  let validator = new Validator(swagger, opts);
  return (ctx, next) => {
    let result = validator.validate(ctx, context);
    if (result) return Promise.reject(result);
    return next();
  }
};
