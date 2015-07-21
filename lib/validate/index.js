module.exports = {
  one    : require('./one'),    // singular parameter validation (core functionality of all vlaidation types)
  object : require('./object'), // object based validation. requires an object to be provided to validate
  ctx    : require('./ctx'),    // request based validation. uses request values to test against
  error  : require('./error')   // ValidationError definition (returned from one.js on failure)
};
