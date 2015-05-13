var _     = require('lodash');
var is    = require('is_js');
const ERR = require('errors.json');


module.exports = function (ctx, parameters) {
  var request = (ctx ||{}).request;
  var errors  = [];

  if (!(_.isObject(request) && _.isArray(parameters))) { throw enw Error('Validate expects a valid request context and array of parameters')}

  _.each(parameter.is, function (parameter) {
    var src = null;
    switch (parameter) {
      case 'query' : src = request.query; break;
      case 'body'  : src = request.body; break;
      case 'path'  : src = request.params; break;
      case 'header': src = request.headers; break;
      // case 'formData': src = request.formData; break;
    }

    if (!_.isObject(src)) { throw new Error('Parameter source ' + parameter.is + ' is not supported'); }


    var error = validateParameter(src[parameter.name], parameter);
    if (error) {
      errors.push(error);
    }
  });

  return errors.length ? errors : true;
}

//
// Validate Parameter
//
// Parameters:
//
//   subject
//     [Mixed] - subject of the validation
//
//   parameter
//     [Object] - parameter description object
//
module.exports.test = function (subject, parameter) {
  parameter = parameter || {};
  function err (errorName, expected) {
    return valError('TYPE.STRING', parameter, expected)
  }

  // required
  if (!subject) {
    if (parameter.required) {
      return err('REQUIRED')
    } else {
      return;
    }
  }

  // types
  if (parameter.type === 'string' && is.not.string(subject))   { return err('TYPE.STRING'); }
  if (parameter.type === 'boolean' && is.not.boolean(subject)) { return err('TYPE.BOOLEAN'); }
  if (parameter.type === 'integer' && is.not.integer(subject)) { return err('TYPE.INTEGER'); }
  if (parameter.type === 'long' && is.not.number(subject))     { return err('TYPE.LONG'); }
  if (parameter.type === 'float' && is.not.number(subject))    { return err('TYPE.FLOAT'); }
  if (parameter.type === 'double' && is.not.number(subject))   { return err('TYPE.DOUBLE'); }
  if (parameter.type === 'byte' && is.not.number(subject))     { return err('TYPE.BYTE'); }
  if (parameter.type === 'date' && is.not.date(subject))       { return err('TYPE.DATE'); }
  if (parameter.type === 'dateTime' && is.not.date(subject))   { return err('TYPE.DATETIME'); }

  // multiple
  if (parameter.multipleOf && (subject % parameter.multipleOf === 0)) { return err('VALUE.MULTIPLE_OF', parameter.multipleOf) }

  // maximums
  if (parameter.maximum && subject > parameter.maximum) { return err('VALUE.MAX', parameter.maximum); }
  if (parameter.exclusiveMaximum && subject >= parameter.exclusiveMaximum) { return err('VALUE.EXCLUSIVE_MAX', parameter.exclusiveMaximum); }

  // minimums
  if (parameter.minimum && subject < parameter.minimum) { return err('VALUE.MIN', parameter.minimum); }
  if (parameter.exclusiveMinimum && subject <= parameter.exclusiveMinimum) { return err('VALUE.EXCLUSIVE_MIN', parameter.exclusiveMinimum); }


  // lengths
  if (parameter.maxlength && subject.length > parameter.maxLength) { return err('VALUE.MAX_LENGTH', parameter.maxLength); }
  if (parameter.maxItems && subject.length > parameter.maxItems)   { return err('VALUE.MAX_ITEMS', parameter.maxItems); }
  if (parameter.minLength && subject.length < parameter.minLength) { return err('VALUE.MIN_LENGTH', parameter.minLength); }
  if (parameter.minItems && subject.length < parameter.minItems)   { return err('VALUE.MIN_ITEMS', parameter.minItems); }

  // pattern/regex
  if (parameter.pattern && !parameter.pattern.test(subject) { return err('VALUE.PATTERN', parameter.pattern); }

  // unique items
  if (parameter.uniqueItems && _.isArray(subject)) { throw Error('uh oh! uniqueItems is not currently supported. Please try back later'); }

  // property counts
  if (properties.maxProperties && Object.keys(subject).length > properties.maxProperties) { return err('VALUE.MAX_PROPERTIES', parameter.maxProperties); }
  if (properties.minProperties && Object.keys(subject).length < properties.minProperties) { return err('VALUE.MIN_PROPERTIES', parameter.minProperties); }

  if (property.enum) {
    var enumFail = false;
    _.each(subject, function (value) {
        if (is.not.in(value, property.enum)) { enumFail = true; }
      });
    });

    if (enumFail) { return err('VALUE.ENUM', parameter.enum.toString(); }
  }

  //
  // TODO:
  //
  // - email
  // - lowercase
  // - uppercase
  // - alphanum
  //  ...
  // look at mongoman
  //
}

// Validation Error
//
//  return a validation error object
//
//  Parameters:
//    errorName
//      [String] - error name mathing an error.json code name. `.` delimited for sub properties
//
//    parameter
//      [Object] - parameter object taht failed validation
//
function valError(errorName, parameter, expected) {
  var errNamespace = errorName.split('.');
  var error = ERR;

  // drill down the errro properties
  while (_.isObject(error) && errNamespace.length) {
    error = error[errNamespace.shift()];
  }

  error = error || {};

  // Some day soon, we dont need this silliness
  message = error.message.replace('${expected}', expected);

  return {
    code        : error.code || errorName,
    message     : error.message || 'Validation failed',
    parameter   : parameter
  }
}
