'use strict';

const _ = require('lodash');

let flatten = require('./helpers/flatten');
let checkpoint = require('./helpers/checkpoint');
let validations = require('./validations');
let normalizations = require('./normalizations');
let ValidationError = require('./error');

class Validator {
  constructor (opts={}) {
  }

  // Validate request context
  ctx (_ctx={}, context, clone) {
    let ctx = clone ? _.cloneDeep(_ctx) : _ctx;
    ctx.fleek = ctx.fleek || {};
    ctx.fleek.validation = false;
    context = context ? context : ctx && ctx.fleek && ctx.fleek.context;
    let expected = context && context.parameters;
    if (!context) {
      ctx.fleek = ctx.fleek || {};
      ctx.fleek.validated = false;
      return ctx;
    };

    // use validation property to store results
    ctx.fleek.validation = { passed: true, failed: false, errors: [] };
    let addError = (e, source) => {
      ctx.fleek.validation.passed = false;
      ctx.fleek.validation.failed = true;
      let errors = e.errors || e;
      for (let err of errors) {
        err.parameter.in = err.parameter.in || source;
        ctx.fleek.validation.errors.push(err)
      }
    }

    let req = ctx.request || {};
    for (let param of (expected || [])) {
      let source = ((param || {}).in || '').toLowerCase();
      let val = {};

      // determine source
      if (source === 'query') val = (req.query || {})[param.name];
      if (source === 'path') val = (ctx.params || ctx.fleek.params || {})[param.name];
      if (source === 'formdata') val = (req.form || {})[param.name];
      if (source === 'body') val = param.schema ? (req.body || {}) : (req.body || {})[param.name];

      // validate
      let result = this.object(val, param);

      // apply result
      if (this.isError(result) || this.isErrorList(result)) addError(result.errors, source);
      else if (source === 'query') (ctx.request.query)[param.name] = result;
      else if (source === 'path') (ctx.params = ctx.fleek.params)[param.name] = result;
      else if (source === 'formdata') (ctx.request.form)[param.name] = result;
      else if (source === 'body') {
        if (param.schema) ctx.request.body = result;
        else (ctx.request.body)[param.name] = result;
      }
    }

    return ctx;
  }

  // Error checking
  isErrorList (e=[]) {
    return (e.length && this.isError(e[0]));
  }
  // Error checking
  isError (e) {
    return (e instanceof ValidationError || e instanceof Error);
  }

  // Validate object context (wrapper)
  object (value, param={}) {
    let result = this._object(_.cloneDeep(value), param, '');
    if (this.isErrorList(result)) {
      let error = new Error('Validation Failed');
      error.errors = result;
      result = error;
    }
    return result;
  }
  // Validate object context (recursive)
  _object (value, param={}, _chain) {
    let errors = [];

    // Body object - special case
    if (param.schema) {
      if (param.schema.properties) {
        let result = this._object(value, param.schema); // recurse
        if (this.isError(result) || this.isErrorList(result)) errors.push(result);
        else value = result;
      } else {
        let propKeys = Object.keys(param.schema);
        for (let key of propKeys) {
          let subParam = param.schema[key];
          subParam.name = subParam.name || key;
          let result = this._object(subParam, param); // recurse
          if (this.isError(result) || this.isErrorList(result)) errors.push(result);
          else (value || {})[subParam.name] = result;
        }
      }

    // Nested object
    } else if (param.properties) {
      let propKeys = Object.keys(param.properties);
      // mark required properties
      let required = param.required || [];
      for (let i = required.length; i >=0; i--) {
        if (param.properties[required[i]]) param.properties[required[i]].required = true;
      }
      for (let key of propKeys) {
        let subParam = param.properties[key] || {};
        subParam.name = subParam.name || key;
        let chain = _chain ? _chain + '.' + subParam.name : subParam.name;
        let result = this._object((value || {})[subParam.name], subParam, chain); // recurse
        if (this.isError(result) || this.isErrorList(result)) errors.push(result);
        else (value || {})[subParam.name] = result;
      }

    // Array
    } else if (param.type === 'array') {
      let result = this.one(value, param, _chain || param.name);
      if (this.isError(result) || this.isErrorList(result)) errors.push(result);
      else {
        value = result;
        let _param = {};
        let validations = Object.keys(param.items);
        for (let v of validations) _param[v] = param.items[v] || _param[v];
        for (let i in value) {
          let chain = _chain ? `${_chain}[${i}]` : `${param.name}[${i}]`;
          let res = this.one(value[i], _param, chain);
          if (this.isError(res) || this.isErrorList(res)) errors.push(res);
          else value[i] = res;
        }
      }

    // Leaf object
    } else {
      let result = this.one(value, param, _chain || param.name);
      if (this.isError(result) || this.isErrorList(result)) errors.push(result);
      else value = result;
    }

    if (errors.length) errors = flatten(errors);
    if (this.isErrorList(errors)) return errors;
    else return value;
  }

  // Validate a single value
  one (value, param={}, chain) {
    let name = chain || param.name;
    let properties = Object.keys(param);

    // set defaults
    let defaultVal = param.default || param.defaultValue || param.defaultVal;
    let result = typeof value === 'undefined' ? defaultVal : value ;

    // Check for required
    if (param.required) result = validations.required(result, param);
    else if (typeof result === 'undefined') return undefined;
    if (this.isError(result) || this.isErrorList(result)) return result;

    // Perform normalizations
    let valSet = [];
    for (let propKey of properties) {
      let norm = normalizations[propKey];
      if (norm) result = norm(result, param);
      else valSet.push(propKey);
    }

    // Perform validations
    for (let propKey of valSet) {
      let validate = validations[propKey];
      if (validate) {
        result = validate(result, param);
        if (this.isError(result) || this.isErrorList(result)) return result;
      }
    }
    return result;
  }
}

module.exports = Validator;
