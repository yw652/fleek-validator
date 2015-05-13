
var Parser = function (docs) {
  this.docs = docs || {};
}

// get the version
Parser.prototype.version = function () {
  return this.docs.swagger;
}

// get the paths array
Parser.prototype.paths = function () {
  return this.docs.paths;
};


//
// Route Validation Map
//
// Return:
// {
//   '/some/endpoint/path' : {
//     get : [{
//       name       : [String],
//       in         : [Body],
//       dscription : [String],
//       required   : [Boolean],
//       type       : [String]
//     }],
//     // ...
//   },
//   //...
// }
//
//
VersionParser.prototype.routeValidationMap = function () {
  return {};
}



module.exports = Parser;
