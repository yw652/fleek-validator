'use strict';

var _             = require('lodash');
var fs            = require('fs');
var configHelpers = require('./config_helpers');
var helpers       = require('./helpers');
var validate      = require('./validate');
var parser        = require('fleek-parser');
const cwd = process.cwd();

var pathSplit = module.parent.filename.split('/');
pathSplit.pop();
const relPath = pathSplit.join('/');

var validator =  function (app, config) {
  config = config || {};

  // if no app is passed in, just return the middleware
  var shouldBindApp = true;
  if (!_.isFunction(app.use)) {
    config = app || {};
    shouldBindApp = false;
  }

  // docs
  const docs = configHelpers.parseSwaggerDocs(relPath, config.swagger);

  // make sure the docs are valid
  if (!docs) { throw new Error('No swagger documentation file recovered. Check the configuration'); }

  // parser
  var swagger = parser.parse(docs);
  if (!swagger) { throw new Error('Fail to parser swagger documentation'); }

  var routeValidationMap = swagger.routeValidationMap;
  var tracePath = helpers.templateTracer(routeValidationMap);

  var valMiddleware = function *(next) {
    this.fleek             = this.fleek || {};
    this.fleek.routeConfig = this.fleek.routeConfig || {};
    this.fleek.validated   = false;

    validate.isErr   = validate.isError = validate.isValError = validate.isValidationError = validate.isValErr = helpers.isValidationError;

    this.fleek.validate    = validate;
    var method       = this.request.method.toLowerCase();
    var path         = null;

    // get the path form the route config
    if (this.fleek.routeConfig.path) {
      path = this.fleek.routeConfig.path

    // if the route config doesnt exist, trace it
    } else {
      path = tracePath(this);
    }

    // unsupported route. return
    if (!path && config.strict) { return; }

    // get the parameters array fro the route
    var parameters = (routeValidationMap[path] || {})[method];
    if (_.isArray(parameters)) {
      this.fleek.validated = true;
      var result = this.fleek.validate.ctx(this, parameters);

      if (this.fleek.validate.isErr(result)) {

        if (_.isFunction(config.catch)) {
          this.fleek.validationError
          yield config.catch.call(this, result, next);

        } else {
          this.status = 400;
          this.body   = result;
        }

        // short circuit on failure
        return;

      } else {
        if (_.isFunction(config.success)) {
          yield config.success().call(this, next);
        }

        yield next;
      }
    }

    yield next;
  }

  if (shouldBindApp) {
    app.use(valMiddleware);
  } else {
    return valMiddleware;
  }
}

validator.validate = validate;
module.exports = validator;
