'use strict';

let flatten = require('./helpers/flatten');
let checkpoint = require('./helpers/checkpoint');
let validations = require('./validations');
let normalizations = require('./normalizations');
let ValidationError = require('./error');

class Validator {
  constructor (swagger={}, opts={}) {
  }

  // Validate request context
  ctx (ctx={}, context) {
    let errors = [];
    context = context ? context : ctx && ctx.fleek && ctx.fleek.context;
    let expected = context && context.parameters;
    if (!context) return this._notPerformed(ctx);
    let req = ctx.request || {};
    for (let param of (expected || [])) {
      let source = ((param || {}).in || '').toLowerCase();
      let val = {};
      switch(source) {
        case 'query': val = req.query || {}; break;
        case 'path': val = ctx.params || ctx.fleek.params || {}; break;
        case 'formdata': val = req.form || {}; break;
        case 'body': val = req.body || {}; break;
      }
      let result = this.object(val, param);
      if (result instanceof ValidationError) errors.push(result);
    }

    if (errors.length) {
      this._failed(ctx, errors);
    } else {
      this._passed(ctx);
    }
  }

  // Validate object context
  object (value, param={}, _chain) {
    let errors = [];

    // Body object - special case
    if (param.schema) {
      if (param.schema.properties) {
        let subErr = this.object(value, param.schema); // recurse
        if (subErr) errors.push(subErr);
      } else {
        let propKeys = Object.keys(param.schema);
        for (let key of propKeys) {
          let subParam = param.schema[key];
          subParam.name = subParam.name || key;
          let subErr = this.object(subParam, param); // recurse
          if (subErr) errors.push(subErr);
        }
      }

    // Nested object
    } else if (param.properties) {
      let propKeys = Object.keys(param.properties);
      // mark required properties
      let required = param.required || [];
      for (let i = param.required.length; i >=0; i--) {
        if (param.properties[required[i]]) param.properties[required[i]].required = true;
      }
      for (let key of propKeys) {
        let subParam = param.properties[key] || {};
        subParam.name = subParam.name || key;
        let chain = _chain ? _chain + '.' + subParam.name : subParam.name;
        let subErr = this.object(value[subParam.name], subParam, chain); // recurse
        if (subErr) errors.push(subErr);
      }

    // Array
    } else if (param.type === 'array') {
      let _param = param;
      let validations = Object.keys(param.items);
      for (let v of validations) _param[v] = _param[v] || para.items[_param[v]];
      for (let i in value) {
        propName = param.name + '[' + i + ']';
        let chain = _chain ? _chain + propName : propName;
        let err = this.one(val, _param, chain);
        if (err) errors.push(err);
      }

    // Leaf object
    } else {
      let err = this.one(value, param, _chain || param.name);
      if (err) errors.push(err)
    }
    return flatten(errors);
  }

  // Validate a single value
  one (value, param={}, chain) {
    let name = chain || param.name;
    let properties = Object.keys(param);

    // set defaults
    let defaultVal = param.default || param.defaultValue || param.defaultVal;
    let result = typeof value === 'undefined' ? defaultVal : value ;

    // Check for required
    if (param.required) result = validations.required(result);
    if (result instanceof ValidationError) return result;

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
        if (result instanceof ValidationError) return result;
      }
    }
    return result;
  }

  //
  // Internal
  //

  _notPerformed (ctx={}) {
    ctx.fleek = ctx.fleek || {};
    ctx.fleek.validated = false;
  }

  _failed (ctx={}, error='unkown error') {
    ctx.fleek = ctx.fleek || {};
    ctx.fleek.validated = Error(error);
    return ctx.fleek.validated
  }

  _passed (ctx={}) {
    ctx.fleek = ctx.fleek || {};
    ctx.fleek.validated = true;
    return ctx.fleek.validated
  }
}

module.exports = Validator;
