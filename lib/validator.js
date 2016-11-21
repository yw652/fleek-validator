'use strict';

let flatten = require('./helpers/flatten');
let checkpoint = require('./helpers/checkpoint');

class Validator {
  constructor (swagger={}, opts={}) {
  }

  // Validate request context
  ctx (ctx={}, context) {
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
      this.object(val, param);
    }

    if (false) {
      this._failed(ctx);
    } else {
      this._passed(ctx);
    }
  }

  // Validate object context
  object (value, param={}) {
    let errors = [];

    // Body object - special case
    if (param.schema) {
      console.log(param)
      if (param.schema.properties) {
        let subErr = this.object(value, param.schema.propterties); // recurse
        if (subErr) errors.push(subErr);
      } else {
        let propKeys = Object.keys(param.schema);
        for (let key of propKeys) {
          let subParam = param.schema[key];
          console.log(key, subParam)
          subParam.name = subParam.name || key;
          let subErr = this.object(subParam, param); // recurse
          if (subErr) errors.push(subErr);
        }
      }

    // Nested object
    } else if (param.properties) {
      let propKeys = Object.keys(param.properties);
      for (let key of propKeys) {
        let subParam = param.properties[key];
        subParam.name = subParam.name || key;
        let subErr = this.object(subParam, param); // recurse
        if (subErr) errors.push(subErr);
      }

    // Array
    } else if (param.type === 'array') {
      let _param = param;
      let validations = Object.keys(param.items);
      for (v of validations) _param[v] = _param[v] || para.items[_param[v]];
      for (val of values) {
        let err = this.one(val, _param);
        if (err) errors.push(err);
      }

    // Leaf object
    } else {
      errors = this.one(value, param);
    }
    return flatten(errors);
  }

  // Validate a single value
  one () {

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
