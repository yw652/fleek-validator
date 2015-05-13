var _          = require('lodash');
var BaseParser = require('./../base_parser');

var VersionParser = function () {
  BaseParser.apply(this, arguments);
}

VersionParser.prototype = Object.create(BaseParser);
//
// Route Validation Map
//
//
//
//
//
//
//
VersionParser.prototype.routeValidationMap = function () {
  var routeMap = {};

  _.each(this.docs.paths, function (pathConfig, pathRoute) {
    _.each(pathConfig, constructPathObj(pathRoute));
  });

  function constructPathObj (pathRoute) {
    return function (endpointConfig, methodType) {
      try {
        if (_.isString(pathRoute) && _.isString(methodType) && _.isString(endpointConfig.tags[0])) {
          routeMap[pathRoute] = routeMap[pathRoute]  || {};
          routeMap[pathRoute][methodType.toLowerCase()] = endpointConfig.parameters || [];


        } else {
          throw new Error('Invalid route configuration');
        }
      } catch (e) {
        console.error('Ignored route: (' + methodType + ' ' + pathRoute + ') because of error');
        console.error(e.stack);
      }
    }
  }

  return routes;
}

module.exports = VersionParser;
