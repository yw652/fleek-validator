var _     = require('lodash');
var is    = require('is_js');
const ERR = require('./../errors.json');


var validate = function (ctx, parameters) {
  var request = (ctx ||{}).request;
  var errors  = [];

  if (!(_.isObject(request) && _.isArray(parameters))) { throw new Error('Validate expects a valid request context and array of parameters'); }

  _.each(parameters, function (parameter) {
    var src = null;
    switch (parameter.in) {
      case 'query' : src = request.query; break;
      case 'body'  : src = request.body; break;
      case 'path'  : src = request.params; break;
      case 'header': src = request.headers; break;
      // case 'formData': src = request.formData; break;
    }

    if (!_.isObject(src)) { throw new Error('Parameter source ' + parameter.in + ' is not supported'); }

    var error = validate.validateParameter(src[parameter.name], parameter);
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
validate.validateParameter = function (subject, parameter) {
  parameter = parameter || {};

  function err (errorName, expected) {
    return valError(errorName, parameter, expected)
  }

  // required
  console.log(subject)
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
  if (parameter.type === 'date' && is.not.dateString(subject)) { return err('TYPE.DATE'); }
  if (parameter.type === 'dateTime' && is.not.date(subject))   { return err('TYPE.DATETIME'); }

  // multiple
  if (parameter.multipleOf && (subject % parameter.multipleOf === 0)) { return err('VALUE.MULTIPLE_OF', parameter.multipleOf); }

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
  if (parameter.pattern) {
    var regex = new RegExp(parameter.pattern);
    if (!regex.test(subject)) { return err('VALUE.PATTERN', parameter.pattern); }
  }

  // unique items
  if (parameter.uniqueItems && _.isArray(subject)) { throw Error('uh oh! uniqueItems is not currently supported. Please try back later'); }

  // property counts
  if (parameter.maxProperties && Object.keys(subject).length > parameter.maxProperties) { return err('VALUE.MAX_PROPERTIES', parameter.maxProperties); }
  if (parameter.minProperties && Object.keys(subject).length < parameter.minProperties) { return err('VALUE.MIN_PROPERTIES', parameter.minProperties); }

  if (parameter.enum) {
    var enumFail = false;
    _.each(subject, function (value) {
      if (is.not.in(value, parameter.enum)) { enumFail = true; }
    });

    if (enumFail) { return err('VALUE.ENUM', parameter.enum.toString()); }
  }

  // email
  if (parameter.email && is.not.email(subject)) { return err('VALUE.EMAIL'); }

  // alphanumeric
  if (parameter.alphanumeric && is.not.alphaNumeric(subject)) { return err('VALUE.ALPHANUMERIC'); }

  // lowercase
  if (parameter.lowercase && is.not.lowercase(subject)) { return err('VALUE.LOWERCASE'); }

  // uppercase
  if (parameter.uppercase && is.not.uppercase(subject)) { return err('VALUE.UPPERCASE'); }
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
  message = (error.message || ERR.GENERIC.message).replace('${expected}', expected);

  return _.defaults({
    name        : errorName || 'GENERIC',
    code        : error.code,
    message     : message,
    parameter   : parameter
  }, ERR.GENERIC);
}

module.exports = validate;
