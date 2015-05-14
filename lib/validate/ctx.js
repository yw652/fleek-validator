var validate = require('./validate_one');
var _        = require('lodash');

//
// Context Validate
//
// Paramters
//  ctx
//    [Object] - Koa request context
//      OR
//    [Boolean] - true is validation passed
//
// Returns:
//   [Array] - array of errors
//
module.exports = function (ctx, parameters) {
  var request = (ctx ||{}).request;
  var errors  = [];

  if (!(_.isObject(request) && _.isArray(parameters))) {
    throw new Error('Validate expects a valid request context and array of parameters');
  }

  _.each(parameters, function (parameter) {
    var src = null;
    switch (parameter.in) {
      case 'query' : src = request.query; break;
      case 'body'  : src = request.body; break;
      case 'path'  : src = request.params; break;
      case 'header': src = request.headers; break;
      // case 'formData': src = request.formData; break;
    }

    if (!_.isObject(src)) {
      throw new Error('Parameter source ' + parameter.in + ' is not supported');
      }

    var error = validate(src[parameter.name], parameter);
    if (error) {
      errors.push(error);
    }
  });

  return errors.length ? errors : true;
}
