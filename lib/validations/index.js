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
      case 'DATETIME': if (!(_.isString(subject) && Date.parse(subject))) return error; break;
      case 'LONG':
      case 'FLOAT':
      case 'DOUBLE':
        if (!_.isNumber(subject)) return error; break;
      // case 'BYTE': if (subject) return error; break;
      case 'BOOLEAN':
        let val = subject;
        val = (val === true || val === '1' || val === 1 || val === 'true') ? true : val;
        val = (val === false || val === '0'|| val === 0 ||  val === 'false') ? false : val;
        if (!(val === true || val === false)) return error;
        else return val;
      case 'DATE':
        let defaultFormat = 'MM/DD/YYYY';
        let dateFormat = _.isString(param.format) ? param.format : defaultFormat;
        let dateErr = new ValidationError('TYPE.DATE', param, dateFormat)
        if (!_.isString(subject)) return dateErr;
        let parsed = moment(subject, dateFormat, (param.strict !== false));
        if (!parsed.isValid()) return dateErr;
        if (param.past && parsed.diff(new Date()) > 0) return new ValidationError('VALUE.PAST');
        if (param.future && parsed.diff(new Date()) < 0) return new ValidationError('VALUE.FUTURE');
        return subject;
    }

    return subject
  }
}
