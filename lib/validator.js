'use strict';

var _             = require('lodash');
var fs            = require('fs');
var configHelpers = require('./config_helpers');
var helpers       = require('./helpers');
var validate      = require('./validate');
var parsers       = require('./parsers')

const cwd = process.cwd();

var pathSplit = module.parent.filename.split('/');
pathSplit.pop();
const relPath = pathSplit.join('/');


var validator =  function (app, config) {
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

  var parser = parsers(docs);
  if (!parser) { throw new Error('Swagger version ' + docs.swagger + ' not supported'); }

  var routeValidationMap = parser.routeValidationMap();

  var tracePath = helpers.templateTracer(routeValidationMap);

  var valMiddleware = function *(next) {
    this.routeConfig = this.routeConfig || {};
    this.validated   = false;
    var method       = this.request.method.toLowerCase();
    var path         = null;

    // get the path form the route config
    if (this.routeConfig.path) {
      path = this.routeConfig.path

    // if the route config doesnt exist, trace it
    } else {
      path = tracePath(this);
    }

    // unsupported route. return
    if (!path && config.strict) { return; }

    // get the parameters array fro the route
    var parameters = (routeValidationMap[path] || {})[method];
    if (_.isArray(parameters)) {
      this.validated = true;
      var result = validate(this, parameters);

      if (_.isArray(result)) {
        var error = {
          error      : 'Validaiton Failed',
          error_name : 'VALIDATION_FAILED',
          details    : result
        };

        if (_.isFunction(config.error)) {
          this.validationError
          yield config.error.call(this, error, next);

        } else {
          this.status = 400;
          this.body   = error;
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

module.exports = validator;
