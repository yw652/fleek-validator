let _               = require('lodash');
let is              = require('is_js');
let ValidationError = require('./error');
let moment          = require('moment');

const ERR = require('./../../errors.json');

//
// Validate
//
// Parameters:
//
//   subject
//     [Mixed] - subject of the validation
//
//   parameter
//     [Object] - parameter description object
//
//  opts
//    [Object]
//
//    defaults
//      [Boolean] - apply default value
//
//  Returns:
//    [ValidationError] - errors object
//      OR
//    [Mixed] - value after applying defaults (if opts.default === true)
//
//
module.exports = function (subject, parameter, opts) {
  // let original = _.clone(subject);
  // parameter    = parameter || {};
  // opts         = opts || {};
  //
  // function err (errorName, expected) {
  //   return new ValidationError(errorName, parameter, expected);
  // }
  //
  // // required
  // if (!subject) {
  //   let result;
  //   if (opts.defaults && (parameter.defaultValue !== undefined || parameter.default !== undefined)) {
  //     result = parameter.defaultValue || parameter.default;
  //
  //   } else if (parameter.required) {
  //     result =  err('REQUIRED');
  //   }
  //
  //   return result;
  // }

  // Data Normalization
  if (parameter.trim) { subject = subject.trim(); }
  if (parameter.toUpperCase) { subject = subject.toUpperCase(); }
  if (parameter.toLowerCase) { subject = subject.toLowerCase(); }

  // allow restrictions to be defined explicitly rather than using a flag
  if (parameter.restriction) {
    parameter[parameter.restriction] = true;
  }

  // types
  if (parameter.type === 'string' && is.not.string(subject))   { return err('TYPE.STRING'); }
  if (parameter.type === 'array' && is.not.array(subject))   { return err('TYPE.ARRAY'); }
  if (parameter.type === 'object' && is.not.object(subject))   { return err('TYPE.OBJECT'); }
  if (parameter.type === 'integer' && !(parseInt(subject, 10) || parseInt(subject, 10) === 0))  { return err('TYPE.INTEGER'); }
  if (parameter.type === 'long' && !parseFloat(subject))     { return err('TYPE.LONG'); }
  if (parameter.type === 'float' && !parseFloat(subject))    { return err('TYPE.FLOAT'); }
  if (parameter.type === 'double' && !parseFloat(subject))   { return err('TYPE.DOUBLE'); }
  if (parameter.type === 'byte' && !parseFloat(subject))     { return err('TYPE.BYTE'); }
  if (parameter.type === 'dateTime' && is.not.date(subject))   { return err('TYPE.DATETIME'); }
  if (parameter.type === 'boolean' && is.not.boolean(subject) && !(subject==='true' || subject==='1') && !(subject==='false' || subject==='0')) {
    return err('TYPE.BOOLEAN');
  }
  if (parameter.type === 'date') {
    let dateFormat = _.isString(parameter.format) ? parameter.format : 'MM/DD/YYYY';
    if (!moment(subject || '', dateFormat, parameter.strict).isValid()) { return err('TYPE.DATE', dateFormat);}
    if (parameter.past && moment(subject || '', dateFormat).diff(new Date()) > 0) { return err('VALUE.PAST'); }
    if (parameter.future && moment(subject || '', dateFormat).diff(new Date()) < 0) { return err('VALUE.FUTURE'); }
  }

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
    let regex = new RegExp(parameter.pattern);
    if (!regex.test(subject)) { return err('VALUE.PATTERN', parameter.pattern); }
  }

  // unique items
  if (parameter.uniqueItems && _.isArray(subject)) { throw Error('uh oh! uniqueItems is not currently supported. Please try back later'); }

  // property counts
  if (parameter.maxProperties && Object.keys(subject).length > parameter.maxProperties) { return err('VALUE.MAX_PROPERTIES', parameter.maxProperties); }
  if (parameter.minProperties && Object.keys(subject).length < parameter.minProperties) { return err('VALUE.MIN_PROPERTIES', parameter.minProperties); }

  // enum
  if (parameter.enum) {
    if (is.not.inArray(subject, parameter.enum)) { return err('VALUE.ENUM', parameter.enum.toString()); }
  }

  // email
  if (parameter.email && is.not.email(subject)) { return err('VALUE.EMAIL'); }

  // alphanumeric
  if (parameter.alphaNumeric && is.not.alphaNumeric(subject)) { return err('VALUE.ALPHANUMERIC'); }

  // lowercase
  if (parameter.lowercase && is.not.lowerCase(subject)) { return err('VALUE.LOWERCASE'); }

  // uppercase
  if (parameter.uppercase && is.not.upperCase(subject)) { return err('VALUE.UPPERCASE'); }

  if (!_.isEqual(subject, original)) return subject;
}
