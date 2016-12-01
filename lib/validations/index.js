'use strict';

const _ = require('lodash');
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
      case 'STRING': if (!_.isString(subject)) return error; break;
      case 'ARRAY': if (!_.isArray(subject)) return error; break;
      case 'OBJECT':if (!_.isPlainObject(subject)) return error; break;
      case 'INTEGER': if (!_.isInteger(subject)) return error; break;
      case 'DATETIME': if (!_.isDate(subject)) return error; break;
      case 'LONG':
      case 'FLOAT':
      case 'DOUBLE':
        if (!_.isNumber(subject)) return error; break;
      // case 'BYTE': if (subject) return error; break;
      case 'BOOLEAN':
        let val = subject;
        val = (val === true || val === '1' || val === 'true') ? true : val;
        val = (val === false || val === '0'||  val === 'false') ? false : null;
        if (val === null) return error;
        else return val;
      case 'DATE':
        let defaultFormat = 'MM/DD/YYYY';
        let dateFormat = _.isString(param.format) ? param.format : defaultFormat;
        if (!moment(subject || '', dateFormat).isValid()) { return new ValidationError('TYPE.DATE', param, dateFormat);}
        if (param.past && moment(subject || '', dateFormat).diff(new Date()) > 0) { return new ValidationError('VALUE.PAST'); }
        if (param.future && moment(subject || '', dateFormat).diff(new Date()) < 0) { return new ValidationError('VALUE.FUTURE'); }
    }

    return subject
  }
}
