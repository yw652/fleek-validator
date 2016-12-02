'use strict';

const _ = require('lodash');
const is = require('is');
const moment = require('moment');

let ValidationError = require('../error');

module.exports = {
  required (subject, param={}, opts) {
    if (typeof subject === 'undefined') return new ValidationError('REQUIRED', param);
    else return subject;
  },
  type (subject, param={}, opts) {
    let type = param.type.toUpperCase();
    let error = new ValidationError(`TYPE.${type}`, param);
    switch (type) {
      case 'STRING': if (!is.string(subject)) return error; break;
      case 'ARRAY': if (!is.array(subject)) return error; break;
      case 'OBJECT':if (!_.isPlainObject(subject)) return error; break;
      case 'INTEGER': if (!is.integer(subject)) return error; break;
      case 'DATETIME': if (!(is.string(subject) && Date.parse(subject))) return error; break;
      case 'LONG':
      case 'FLOAT':
      case 'DOUBLE':
        if (!is.number(subject)) return error; break;
      // case 'BYTE': if (subject) return error; break;
      case 'BOOLEAN':
        let val = subject;
        val = (val === true || val === '1' || val === 1 || val === 'true') ? true : val;
        val = (val === false || val === '0'|| val === 0 ||  val === 'false') ? false : val;
        if (!(val === true || val === false)) return error;
        else return val;
      case 'DATE':
        let defaultFormat = 'MM/DD/YYYY';
        let dateFormat = is.string(param.format) ? param.format : defaultFormat;
        let dateErr = new ValidationError('TYPE.DATE', param, dateFormat)
        if (!is.string(subject)) return dateErr;
        let parsed = moment(subject, dateFormat, (param.strict !== false));
        if (!parsed.isValid()) return dateErr;
        if (param.past && parsed.diff(new Date()) > 0) return new ValidationError('VALUE.PAST');
        if (param.future && parsed.diff(new Date()) < 0) return new ValidationError('VALUE.FUTURE');
        return subject;
    }

    return subject
  }
}

//
//   if (parameter.pattern) {
//     let regex = new RegExp(parameter.pattern);
//     if (!regex.test(subject)) { return err('VALUE.PATTERN', parameter.pattern); }
//   }
//
//   // unique items
//   if (parameter.uniqueItems && _.isArray(subject)) { throw Error('uh oh! uniqueItems is not currently supported. Please try back later'); }
//
//   // property counts
//   if (parameter.maxProperties && Object.keys(subject).length > parameter.maxProperties) { return err('VALUE.MAX_PROPERTIES', parameter.maxProperties); }
//   if (parameter.minProperties && Object.keys(subject).length < parameter.minProperties) { return err('VALUE.MIN_PROPERTIES', parameter.minProperties); }
//
//   // enum
//   if (parameter.enum) {
//     if (!is.inArray(subject, parameter.enum)) { return err('VALUE.ENUM', parameter.enum.toString()); }
//   }
//
//   // email
//   if (parameter.email && !is.email(subject)) { return err('VALUE.EMAIL'); }
//
//   // alphanumeric
//   if (parameter.alphaNumeric && !is.alphaNumeric(subject)) { return err('VALUE.ALPHANUMERIC'); }
//
//   // lowercase
//   if (parameter.lowercase && !is.lowerCase(subject)) { return err('VALUE.LOWERCASE'); }
//
//   // uppercase
//   if (parameter.uppercase && !is.upperCase(subject)) { return err('VALUE.UPPERCASE'); }
//
//   if (!_.isEqual(subject, original)) return subject;
// }
//
