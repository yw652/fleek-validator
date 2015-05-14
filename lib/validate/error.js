var _     = require('lodash');
const ERR = require('./../../errors.json');

//
// Validation Error {Class}
//
// Parameters
//   errorName
//     [String] - `.` delimited property chain specifying an error from errors.json
//
//   parameter
//     [Object] - parameter which fialed validation
//
//   expected
//     [String] (optional) - string representation of the expected value
//
function ValidationError (errorName, parameter, expected) {
  var errNamespace = errorName.split('.');
  var error = ERR;

  // drill down the errro properties
  while (_.isObject(error) && errNamespace.length) {
    error = error[errNamespace.shift()];
  }

  this.name      = errorName || 'GENERIC';
  this.code      = error.code || ERR.GENERIC.code;
  this.message   = (error.message || ERR.GENERIC.message).replace('${expected}', expected);
  this.parameter = parameter;
}

module.exports = ValidationError;
