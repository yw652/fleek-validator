
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
Parser.prototype.routeValidationMap = function () {
  return {};
}

//
// Resolve Reference
//
// Parameters:
//   ref
//     [String] - reference string: `#/some/reference`
//
// Return:
//   [Mixed] - content at the end of the reference
//
//
Parser.resolveRef = function (ref) {
  var refSplit = (ref || '').split('/');
  refSplit.shift();

  var result = this.docs[refSplit];
  while (result && refSplit.length) {
    result = result[refSplit.shift];
  }

  return result;
}

module.exports = Parser;
