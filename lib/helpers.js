var _      = require('lodash');
var router = require('koa-router')();
var co     = require('co');
var ValErr = require('./validate').error;

//
// Path to absolute
//
// normalize both relative and absolute paths to be absolue (relative start with `.`)
//
// Parameters:
//   basePath
//     [String] - base path to resolve relative paths
//
//   initPath
//     [String] - path to build to, abolute or relative
//
//
exports.pathToAbsolute = function (basePath, initPath) {
  if (!(_.isString(basePath) && _.isString(initPath))) { throw new Error('pathtoAbsolute requires both basePath and initPath to be strings'); }

  var result = null;

  // relative
  if (~initPath.indexOf('.')) {
    pathSplit = initPath.split('/')
    pathSplit.shift();
    initPath = pathSplit.join('/');
    initPath = ~initPath.indexOf('/') ? initPath : '/' + initPath;
    result   = basePath + initPath;

  // absolute
  } else {
    result = initPath;
  }

  return result;
}

//
// Join Paths
//
// join path with a leading / and /'s between them
//
// Parameters
//   leading
//     [String] - first path to join
//
//  trailing
//    [String] - second path to join
//
exports.joinPaths = function (leading, trailing) {
  if (!(_.isString(leading) && _.isString(trailing))) { throw new Error('joinPaths requires both leading and trailing to be strings'); }
  if (!(leading && trailing)) { return leading + trailing; }

  var newPath = leading;
  newPath = newPath.indexOf('/') === 0 ? newPath : '/' + newPath;

  if (/\/$/.test(newPath) && ~trailing.indexOf('/')) {
    trailing = trailing.substring(1);

  } else if (!/\/$/.test(newPath) && trailing.indexOf('/')) {
    newPath +=  '/'
  }

  return newPath + trailing;
}


//
// Path To Template
//
// Parameters:
//   templates
//     [Array] - array of path template strings. eg: `/foo/:id`
//
//
exports.templateTracer = function (routeSet) {
  // build out the router using the templates
  _.each(routeSet, function (methods, path) {
    _.each(methods, function (details, method) {
       router[method](path, function *() {});
     });
   });

  // use a map to avoid searching a giant list of paths+methods on every request
  var methodMap = {};

  // transcribe the route for tracing
  var compiledTemplates = _.map(router.stack.routes, function (route) {
    _.each(route.methods, function (method) {
      method = method.toLowerCase();
      methodMap[method] = methodMap[method] || [];
      methodMap[method].push({
        path   : route.path,
        regexp : route.regexp
      });
    });
  });

  // return a function to get the template
  return function (ctx) {
    ctx.fleek.routeConfig = ctx.fleek.routeConfig || {};

    methodPaths = methodMap[ctx.request.method.toLowerCase()];
    _.each(methodPaths, function (compiledTemplate) {
      if (compiledTemplate.regexp.test(ctx.request.path)) {
        ctx.fleek.routeConfig.path = compiledTemplate.path
        return false; // we're done here
      }
    });

    return ctx.fleek.routeConfig.path;
  }
}

//
// Parameterize Properties
//
// Parameters
//   [Object] - property object to be converted
//
// Returns
//   [Array] - array of parameter objects generated from the properties object
//
exports.parameterizeProps = function (properties) {
  return _.map(properties, function (details, name) {
    var parameter = {};
    parameter.name = name;

    // remove blacklisted enumerated properties
    if (details.enum) {
      delete details.enum;
    }

    parameter = _.defaults(parameter, details);

    return parameter;
  });
}

//
// Format Results
//
// Parameters
//   [Mixed] - result of validation
//
// Returns
//   [Mixed] - formatted error arrary, or plain result if no error is detected
//
exports.formatResult = function (result) {
  var error;
  if (result.length) {
    error = {
      error      : 'Validation Failed',
      error_name : 'VALIDATION_FAILED',
      details    : result
    };
  }

  return error ? error : result || true;
}


//
// Is Validation Error
//
// Parameters
//   [Mixed] - result of validation
//
// Returns
//   [booleam] - whether or not the result is a validation error
//
exports.isValidationError = function (result) {
  return ValErr.prototype.isPrototypeOf(result) || ((result || {}).error_name === 'VALIDATION_FAILED');
}
