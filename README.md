# Fleek Validator

[![Build Status](https://travis-ci.org/fleekjs/fleek-validator.svg)](https://travis-ci.org/fleekjs/fleek-validator) [![npm](https://img.shields.io/npm/l/express.svg)](https://github.com/fleekjs/fleek-validator/blob/master/LICENSE)  [![Dependencies](https://img.shields.io/david/fleekjs/fleek-validator.svg)](https://david-dm.org/fleekjs/fleek-validator) [![Join the chat at https://gitter.im/fleekjs/fleek-validator](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/fleekjs/fleek-validator?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


Koa middleware that validates request against [swagger documentation](http://swagger.io/).

`$ npm install fleek-validator`

Quick reference:
- Best used in tandem with the [fleek-router](#koa-on-fleek)
- Validations are based on the swagger [parameter specifications](https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#parameter-object), but many additional validations have been added that are not supported by swagger directly
- A request may pass erroneously pass validation if the route is not recognized or the configuration is not correct. if no validation is run `this.validated` will be `false`
- The `validate` object/helper will be added to the request context and can be accessed during request handling. eg: `this.validate.one(foo, {/* parameter decription*/})`
- if koa-router is not used, paths will be mapped to swager docs using the [koa-router](https://github.com/koajs/route) module. If another routing module is used in the stack, unexpected results may appear (you have been warned!)
- A full list of errors an codes can be found in [error.json](https://github.com/gohart/fleek-validator/blob/master/errors.json)

## Key

- [Usage](#usage)
  - [Basic](#basic)
  - [Fully Custom (paths)](#fully-custom-paths)
  - [Fully Custom (objects)](#fully-custom-objects)
  - [Koa on Fleek](#koa-on-fleek)
- [Response Structure](#response-structure)
- [Static Utilities](#static-utilities)
  - [validator.validate](#validatorvalidate)
    - [`validate.one`](#validateone)
    - [`validate.object`](#validateobject)
    - [`validate.ctx`](#validatectx)
    - [`validate.error`](#validateerror)
    - [`validate.isError`](#iserror)
- [Configuration](#configuration)
  - [`config.swagger`](#configswagger)
  - [`config.success`](#configsuccess)
  - [`config.error`](#configerror)
  - [`config.strict`](#configstrict)
- [Validations](#validation)
  - [Types](#types)
    - [`string`](#string)
    - [`integer`](#integer)
    - [`long`](#long)
    - [`float`](#float)
    - [`double`](#double)
    - [`byte`](#byte)
    - [`dateTime`](#dateTime)
    - [`date`](#date)
    - [`boolean`](#boolean)
  - [Restrictions](#restrictions)
    - [`multipleOf`](#multipleof)
    - [`maximum`](#maximum)
    - [`exclusiveMaximum`](#exclusiveMaximum)
    - [`minimum`](#minimum)
    - [`exclusiveMinimum`](#exclusiveMinimum)
    - [`maxlength`](#maxlength)
    - [`maxItems`](#maxItems)
    - [`minLength`](#minLength)
    - [`minItems`](#minItems)
    - [`pattern`](#pattern)
    - [`maxProperties`](#maxproperties)
    - [`minProperties`](#minproperties)
    - [`enum`](#enum)
    - [`email`](#email)
    - [`alphaNumeric`](#alphanumeric)
    - [`lowercase`](#lowercase)
    - [`uppercase`](#uppercase)
    - [`format`](#format)
    - [`past`](#past)
    - [`future`](#future)
  - [Hygiene](#hygiene)
    - [`trim`](#trim)
    - [`toUpperCase`](#touppercase)
    - [`toLowerCase`](#tolowercase)
  - [Miscellaneous](#miscellaneous)
    - [`defaltsValue`](#defaultvalue)
    - [`required`](#required)
- [Reference Material](#reference-material)
- [Authors](#authors)

## Usage

### Basic

- Swagger docs will be retrieved from `./api.json`, `/swagger.json`, `/config/api.json`, or `/config/swagger.json` in that order
- [Full example](/examples/basic.js)

```javascript
let koa       = require('koa');
let validator = require('fleek-validator');
let parser    = require('koa-bodyparser');
let app       = koa();

app.use(parser());
app.use(validator());
app.use(function *() {
  this.body = { message : 'validation passed' };
});

app.listen(7000);

```

### Fully Custom (paths)

- Swagger docs are pulled from `./custom/docs.json`
- error is run on validation failure
- success is run on validation pass (before next middlware)
- [**TODO** Full example]()

```javascript
var koa            = require('koa');
var router         = require('koa-router')();
var fleekValidator = require('fleek-validator');
var app = koa();

fleekValidator(app, {
  swagger : './custom/docs.json',
  strict  : true, // fail any route not in the swagger docs
  success : function *(next) {
    console.log('Passed validation!')
  },
  error  : function *(err, next) {
    console.log('Failed Validation :(');
    this.body = err;
  }
});

router.get('/', function *() {
  console.log('hello from root')
});

app.listen(3000);
```

### Fully custom (objects)

- Swagger docs are parsed from the object provided
- error is run on validation failure
- success is run on validation pass (before next middlware)
- [**TODO** Full example]()

```javascript
var koa            = require('koa');
var router         = require('koa-router')();
var fleekValidator = require('fleek-validator');
var app = koa();

fleekValidator(app, {
  swagger      : require('./some/swagger/generator')(),
  strict  : true, // fail any route not in the swagger docs
  success : function *(next) {
    console.log('Passed validation!')
  },
  error  : function *(err, next) {
    console.log('Failed Validation :(');
    this.body = err;
  }
});

router.get('/', function *() {
  console.log('hello from root')
});

app.listen(3000);
```

### Koa on fleek

- Controllers are pulled from the `./controllers` directory
- Swagger docs will be retrieved from `./api.json`, `/swagger.json`, `/config/api.json`, or `/config/swagger.json` in that order
- routes wil be generated by fleek-router
- [**TODO** Full example]()

```javascript
var koa         = require('koa');
var fleekRouter = require('fleek-router');
var app = koa();

fleekRouter(app, {
  authenicate : true,
  validate    : {
    error : function *(err, next) {
      console.log('oh no! Returning default errors');
    }
  }
});

app.listen(3000);
```

## Response Structure

- The following structure will be followed in errors passed to the error handler specified
- If no error handler is specified, the error will be sent to the client with the status `400`
- A full list of errors an codes can be found in [error.json](https://github.com/gohart/fleek-validator/blob/master/errors.json)

```javscript
{
  "error": "Validation Failed",
  "error_name": "VALIDATION_FAILED",
  "details": [{
    "name": "VALUE.FOO",
    "code": 204,
    "message": "Must be a valid foo string",
    "parameter": {
      "name": "some_val",
      "in": "body",
      "description": "fooget about it",
      "required": true,
      "type": "string",
      "foo": true
    }
  }]
}
```

## Static Utilities

### validator.validate

- A collection of static utilities

```javascript
var val    = require('fleek-validator').validate;
var errors = val.one(foo, {/* swagger parameter object foo must match */})

// OR - if using fleek-validor as middleware
function *(next) {
  var errors = this.validate.one(foo, {/* swagger parameter object foo must match */});
}
```

### validate.one

- validate a single object against a swagger parameter object

```javascript
var error = validator.validate.one(fooEmail, {
  type  : 'string',
  email : true
})
```

### validate.object

- validate an object of values against an array of swagger parameter objects
- also accepts accepts definition property objects
   - eg:

```javascript
      definitions : {
        UserModel : {
          parameters : {
            name : {
              type    : "string",
              required: true
            }
          }
        }
      }
```

#### parameters

- subject [String] - `.` delimited error property chain to identify which [error.json](https://github.com/gohart/fleek-validator/blob/master/errors.json) error to generate
- parameters [Object] - swagger parameter description which failed
- options [object] (optional)
  - trim [Boolean] - if true, trim properties from the result that aren't in the the parameters array
  - defaults [Boolean] - if true, apply any `defaultValue`'s from the parameters array
  - partial [Boolean] - if true, allow `required` parameters to pass through undefined (useful for partial updates)

#### returns

- [Array] - array of validation errors
- [Object] - the object which passed validation, after options are applied

```javascript
var parameters = [
  {
    name  : 'user_email',
    type  : 'string',
    email : true
  }, {
    name    : 'user_password',
    type    : 'string',
    pattern : passwordRegexp
  }, {
    name         : 'confirmed',
    defaultValue : false
  }
];

var subject = {
  user_email    : fooEmail,
  user_password : fooPwd,
  injection     : someMaliciousInjection
};

var result = validator.validate.object(subject, parameters, {
  trim     : true,
  defaults : true,
});
// result -> {
//   user_email    : fooEmail,
//   user_password : fooPwd,
//   confirmed     : false
// }
```

### validate.ctx

- validate a request context against a set of swagger params

```javascript
var errors = validator.validate.ctx(ctx, [
  {
    name  : 'user_email',
    type  : 'string',
    email : true
  }, {
    name    : 'user_password',
    type    : 'string',
    pattern : passwordRegexp
  }
])
```

### validate.error

- An error class for validation errors `[ValidationError]`

#### parameters

- errorName [String] - `.` delimited error property chain to identify which [error.json](https://github.com/gohart/fleek-validator/blob/master/errors.json) error to generate
- parameter [Object] - swagger parameter description which failed
- expected [String] (optional) - expected value for the parameter (replaces instances of `${expected}` in the message)

```javascript
var someError = new validator.validate.error('TYPE.STRING', someParameter, 'alphanumeric');
```

## validate.isError

- detects whether or not the object is a validation error

#### parameters

- result [Mixed] - result object to test for validation failure

#### alias

- isErr
- isValidationError
- isValidationErr
- isValError
- isValErr

```javascript
var failedValidationResult = validator.validate.isError(resultOfValidation);
```

## Configuration


### config.swagger

#### [optional]

#### summary

- sets the swagger documentation source for compiling routes.

#### accepts

- `Object` - javascript object mapping to the swagger doc format exactly
- `String` - path to the swagger json file (relative or absolute)
- `Undefined` - attempts to find the config in the following places `./api.json`, `./swagger.json`, `./config/api.json`, and `./config/swagger.json`

```javascript
config.swagger = undefined; // attempts to resolve internally
// OR
config.swagger = './some/relative/swag.json';
// OR
config.swagger = '/some/absolute/swagger.json';
// OR
config.swagger = require('./a/function/returning/swag')();
```

### config.success

#### [optional]

#### summary

- Success handler to run if validation succeeds (before the next middleware)
- The next middlewre funciton is provided

#### accepts

- `Function` - executed on validation success

```javascript
config.succcess = function *(next) {
  console.log('woo! validation passed!');
}
```

### config.error || config.catch

#### [optional]

#### summary

- Error handler to run if validation fails
- The validation error and the next middleware function are provided
- If not provided, the default validation error structure is returned to the client

#### accepts

- `Function` - executed on validation failure

```javascript
config.error = function *(err, next) {
  console.log('oh no! Returning default errors');
}
```


### config.strict

#### [optional]

#### summary

- Determines whether or not to reject undocumented routes

#### accepts

- `Boolean` -  if true, undocumented routes will fail validation

```javascript
config.strict = true;
```

## Validation

Validates params based on configuration. Can be used in either the `parameters` structure in a path or the `properties` structure of a definition

#### Path Parameters

_Paramer validation will occur during middleware execution_

```JSON
{
  "paths" : {
    "/foo" : {
      "post" : {
        "parameters" : [{
          "name"         : "someFormParam",
          "in"           : "body",
          "description"  : "An arbitrary date",
          "type"         : "date",
          "defaultValue" : "01/01/1990"
        }, {
          "name"         : "someQueryParam",
          "in"           : "query",
          "description"  : "An arbitrary required string",
          "required"     : true,
          "type"         : "string",
          "alphaNumeric" : true
        }]
      }
    }
  }
}
```

#### Definition Parameters

_Definition validation must be called explicitly with a static function_

```JSON
{
  "definitions" : {
    "someDefinition" : {
      "properties": {
        "someFormParam" : {
          "description"  : "An arbitrary date",
          "type"         : "date",
          "defaultValue" : "01/01/1990"
        },
        "someQueryParam" : {
          "description"  : "An arbitrary required string",
          "type"         : "string",
          "required"     : true,
          "alphaNumeric" : true
        }
      }
    }
  }
}
```

### Types

#### `string`

Accept any String value

```JSON
"parameters": [{
  "name" : "foo",
  "type" : "string",
  "in"   : "body"
}]
```

#### `integer`

Accept any integer value

```JSON
"parameters": [{
  "name" : "foo",
  "type" : "integer",
  "in"   : "body"
}]
```

#### `long`

Accept any long value

```JSON
"parameters": [{
  "name" : "foo",
  "type" : "long",
  "in"   : "body"
}]
```

#### `float`

Accept any float value

```JSON
"parameters": [{
  "name" : "foo",
  "type" : "float",
  "in"   : "body"
}]
```

#### `double`

Accept any double value

```JSON
"parameters": [{
  "name" : "foo",
  "type" : "double",
  "in"   : "body"
}]
```

#### `byte`

Accept any byte value

```JSON
"parameters": [{
  "name" : "foo",
  "type" : "byte",
  "in"   : "body"
}]
```

#### `dateTime`

Accept any dateTime value

```JSON
"parameters": [{
  "name" : "foo",
  "type" : "dateTime",
  "in"   : "body"
}]
```

#### `date`

Accept any date value of form `MM/DD/YY`. see [format](#format) for custom format. using `"strict": true`

```JSON
"parameters": [{
  "name" : "foo",
  "type" : "date",
  "in"   : "body"
}]
```


#### `boolean`

Accept any boolean value

```JSON
"parameters": [{
  "name" : "foo",
  "type" : "boolean",
  "in"   : "body"
}]
```


### Restrictions

#### `multipleOf`

- _Required Type_: Number
- _Description_: Reject any number not a multiple of the config value
- _Expects_: Number to compare

```JSON
"parameters": [{
  "name"       : "foo",
  "in"         : "body",
  "type"       : "integer",
  "multipleOf" : 10
}]
```

#### `maximum`

- _Required Type_: Number
- _Description_: Reject any number greater than the config value
- _Expects_: Number maximum

```JSON
"parameters": [{
  "name"    : "foo",
  "type"    : "integer",
  "in"      : "body",
  "maximum" : 10
}]
```

#### `exclusiveMaximum`

- _Required Type_: Number
- _Description_: Reject any number greater than or equal to the config value
- _Expects_: Number maximum

```JSON
"parameters": [{
  "name"             : "foo",
  "type"             : "integer",
  "in"               : "body",
  "exclusiveMaximum" : 10
}]
```

#### `minimum`

- _Required Type_: Number
- _Description_: Reject any number less than the config value
- _Expects_: Number minimum

```JSON
"parameters": [{
  "name"    : "foo",
  "type"    : "integer",
  "in"      : "body",
  "minimum" : 10
}]
```

#### `exclusiveMinimum`

- _Required Type_: Number
- _Description_: Reject any number less than or equal to the config value
- _Expects_: Number maximum

```JSON
"parameters": [{
  "name"             : "foo",
  "type"             : "integer",
  "in"               : "body",
  "exclusiveMinimum" : 10
}]
```

#### `maxLength`
#### `maxItems`

- _Required Type_: Array
- _Description_: Reject any array containing more than the number the config value
- _Expects_:  Maximum number of properties allowed

```JSON
"parameters": [{
  "name"      : "foo",
  "type"      : "array",
  "in"        : "body",
  "maxLength" : 10,
  "maxItems"  : 10
}]
```

#### `minLength`
#### `minItems`

- _Required Type_: Array
- _Description_: Reject any array containing fewer than the number the config value
- _Expects_:  Minimum number of properties allowed

```JSON
"parameters": [{
  "name"      : "foo",
  "type"      : "array",
  "in"        : "body",
  "minLength" : 10,
  "minItems"  : 10
}]
```

#### `pattern`

- _Required Type_: String
- _Description_: Reject any pattern not matching the config value
- _Expects_: RegExp string

```JSON
"parameters": [{
  "name"    : "foo",
  "type"    : "string",
  "in"      : "body",
  "pattern" : "\\s*foo\\s*"
}]
```

#### `maxProperties`

- _Required Type_: Object
- _Description_: Reject any object with fewer than number specified
- _Expects_: Number maximum

```JSON
"parameters": [{
  "name"          : "foo",
  "type"          : "object",
  "in"            : "body",
  "maxProperties" : 10
}]
```

#### `minProperties`

- _Required Type_: Object
- _Description_: Reject any object with greater than number specified
- _Expects_: Number minimum

```JSON
"parameters": [{
  "name"          : "foo",
  "type"          : "object",
  "in"            : "body",
  "minProperties" : 10
}]
```

#### `enum`

- _Required Type_: Mixed
- _Description_: Reject any value not in the config array
- _Expects_: array

```JSON
"parameters": [{
  "name" : "foo",
  "type" : "string",
  "in"   : "body",
  "enum" : ["accepted", "values"]
}]
```

#### `email`

- _Required Type_: String
- _Description_: Reject any invalid email address
- _Expects_: Boolean

```JSON
"parameters": [{
  "name"  : "foo",
  "type"  : "string",
  "in"    : "body",
  "email" : true
}]
```

#### `alphaNumeric`

- _Required Type_: String
- _Description_: Reject any non alpha-numeric value
- _Expects_: Boolean

```JSON
"parameters": [{
  "name"         : "foo",
  "type"         : "string",
  "in"           : "body",
  "alphaNumeric" : true
}]
```

#### `lowercase`

- _Required Type_: String
- _Description_: Reject any value with uppercase values
- _Expects_: Boolean

```JSON
"parameters": [{
  "name"      : "foo",
  "type"      : "string",
  "in"        : "body",
  "lowercase" : true
}]
```

#### `uppercase`

- _Required Type_: String
- _Description_: Reject any value with lowercase values
- _Expects_: Boolean

```JSON
"parameters": [{
  "name"      : "foo",
  "type"      : "string",
  "in"        : "body",
  "uppercase" : true
}]
```

#### `format`

- _Required Type_: Date
- _Description_: Reject any string not fitting the date format
- _Expects_: String following [Moment](http://momentjs.com) formatting

```JSON
"parameters": [{
  "name"   : "foo",
  "type"   : "date",
  "in"     : "body",
  "format" : "MM-DD-YYYY"
}]
```

#### `past`

- _Required Type_: Date
- _Description_: Reject any date that is not in the past
- _Expects_: Boolean

```JSON
"parameters": [{
  "name" : "foo",
  "type" : "date",
  "in"   : "body",
  "past" : true
}]
```

#### `future`

- _Required Type_: Date
- _Description_: Reject any date not in the future
- _Expects_: boolean

```JSON
"parameters": [{
  "name"   : "foo",
  "type"   : "date",
  "in"     : "body",
  "future" : true
}]
```


### Hygiene

#### `trim`

- _Required Type_: String
- _Description_: Trims leading and trailing whitespace
- _Expects_: Boolean

```JSON
"parameters": [{
  "name" : "foo",
  "type" : "date",
  "in"   : "body",
  "trim" : true
}]
```

#### `toUpperCase`

- _Required Type_: String
- _Description_: perform a `toUpperCase` operation on the parameter
- _Expects_: Boolean

```JSON
"parameters": [{
  "name"        : "foo",
  "type"        : "date",
  "in"          : "body",
  "toUpperCase" : true
}]
```

#### `toLowerCase`

- _Required Type_: String
- _Description_: perform a `toLowerCase` operation on the parameter
- _Expects_: Boolean

```JSON
"parameters": [{
  "name"        : "foo",
  "type"        : "date",
  "in"          : "body",
  "toLowerCase" : true
}]
```

### Miscellaneous

#### defaultValue

- _Required Type_: Mixed
- _Description_: Sets the parameter if none is provided
- _Expects_: Mixed

```JSON
"parameters": [{
  "name"         : "foo",
  "type"         : "date",
  "in"           : "body",
  "defaultValue" : "Hello World."
}]
```


#### required

- _Required Type_: Mixed
- _Description_: Rejects any request not containing a value for the parameter. Performed before validation, but after defaults
- _Expects_: boolean

```JSON
"parameters": [{
  "name"     : "foo",
  "type"     : "date",
  "in"       : "body",
  "required" : true
}]
```


## Reference Material

#### Swagger

- [Home](http://swagger.io/)
- [Editor Demo](http://editor.swagger.io/)
- [Documentation](https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md)

#### By the authors

- [Hart Engineering](http://engineering.hart.com/)


## Authors

- [John Hofrichter](https://github.com/johnhof)
- [Peter A. Tariche](https://github.com/ptariche)
- [Lan Nguyen](https://github.com/lan-nguyen91)

_Built and maintained with [<img width="15px" src="http://hart.com/wp-content/themes/hart/img/hart_logo.svg">](http://hart.com/) by the [Hart](http://hart.com/) team._
