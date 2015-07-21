var validate        = require('./one');
var ValidationError = require('./error');
var helpers         = require('./../helpers');
var _               = require('lodash');

//
// Context Validate
//
// Paramters
//  subject
//    [Object] - subject of the validation
//
//  parameters
//    [Array] - set of parameter objects to validate against
//
//  opts
//    [Object]
//
//    trim
//      [Boolean] - trim anything not accounted for in the validation
//
//    partial
//      [Boolean] - allow undefined values even if required
//
//    defaults
//      [Boolean] - apply default values
//
// Returns:
//   [Array] - array of errors
//     OR
//   [Object] - sanitized object
//
module.exports = function (subject, parameters, opts) {
  var errors    = [];
  var resultObj = {};

  opts = opts || {};

  if (!(_.isObject(subject) && (_.isArray(parameters) || _.isObject(parameters)))) {
    throw new Error('Validate object expects a valid subject and array of parameters');
  }

  if (_.isObject(parameters)) {
    parameters = helpers.parameterizeProps(parameters);
  }

  _.each(parameters, function (parameter) {
    // allow undefined values if partial option
    if (opts.partial && subject[parameter.name] === undefined) {
      return;
    }

    var result = validate(subject[parameter.name], parameter, opts);
    if (result !== undefined) {
      if (helpers.isValidationError(result)) {
        errors.push(result);
      } else if (opts.defaults) {
        resultObj[parameter.name] = result;
      }
    } else if (opts.trim) {
      resultObj[parameter.name] = subject[parameter.name]
    }
  });

  result = opts.trim ? resultObj : subject
  return helpers.formatResult(errors.length ? errors : result);
}
