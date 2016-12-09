# Fleek Validator

Middleware and utilities for validating data against [swagger](http://swagger.io/specification/) schema's.

Requirements:
- Node >= 6.0.0
- [fleek-context](https://github.com/fleekjs/fleek-context)

# Usage

This package is to be used as middleware for [Koa2](https://github.com/koajs/koa/tree/v2.x) to validate swagger documentation using `ctx.fleek.context` defined by [fleek-context](https://github.com/fleekjs/fleek-context) or an equivalent custom middleware. Results of the validation are mapped to `ctx.fleek.validation`, including `passed`, `failed`, and `errors`.

```
npm install --save fleek-validator
```

# Examples

For a swagger example, refer to the test [swagger json](https://github.com/fleekjs/fleek-validator/blob/master/tests/swagger.json)

```javascript
const Koa = require('koa');
const fleekCtx = require('fleek-context');
const fleekValidator = require('fleek-validator');

const SWAGGER = require('./swagger.json');

let app = new Koa();

app.use(fleekCtx(SWAGGER));

app.use(fleekValidator()); // Reject promise for validation failure

// OR

app.use(fleekValidator().catch((ctx, next) => {
  console.log(ctx.fleek.validation); // =>{
  //   passed: [Boolean],
  //   failed: [Boolean],
  //   errors: [Array({ - github.com/fleekjs/fleek-validator/blob/lib/error/index.js
  //    name: [String] - github.com/fleekjs/fleek-validator/blob/lib/error/codes.json
  //    code: [Integer] - github.com/fleekjs/fleek-validator/blob/lib/error/codes.json,
  //    message: [String] - github.com/fleekjs/fleek-validator/blob/lib/error/codes.json,
  //    parameter : { [rejected param definition from swagger doc] }
  //  })]
  // }
  return next();
}));

app.listen(3000);
```

# Documentation

## Middleware

- Accepts
  - Object - options
    - `throw`: Boolean - if false, do not reject the middleware promise on validation failure
    - `catch`: Function - must act as [Koa2](https://github.com/koajs/koa/tree/v2.x) middleware. this will be call if validation fails, with `next` referring to the next middleware in the chain. prioritized over `throw`
- Returns
  - Function - returns a promise when called
    - Accepts
      - Object - context of the request. must have `ctx.fleek.context` to perform validation
      - Function - returns promise when called
- Binds
  - `ctx.fleek.validation`

```javascript
{
  passed: [Boolean],
  failed: [Boolean],
  errors: [Array({ - github.com/fleekjs/fleek-validator/blob/lib/error/index.js
   name: [String] - github.com/fleekjs/fleek-validator/blob/lib/error/codes.json
   code: [Integer] - github.com/fleekjs/fleek-validator/blob/lib/error/codes.json,
   message: [String] - github.com/fleekjs/fleek-validator/blob/lib/error/codes.json,
   parameter : { [rejected param definition from swagger doc] }
 })]
}
```

### Example

```javascript
app.use(validator()); // reject middleware promise on failure

app.use(validator({ throw: false })); // continue down middleware on failure

app.use(validator({ catch: (ctx, next) => { return next(); } })); // continue down middleware on failure
app.use(validator().catch((ctx, next) => { return next(); })); // continue down middleware on failure
```

## Ctx

- Accepts
  - Object - context of a request definted by [Koa2](https://github.com/koajs/koa/tree/v2.x), and containing `ctx.fleek.context` to define the validations
  - Object - swagger definition to validate, matches `ctx.fleek.context` set by [fleek-context](https://github.com/fleekjs/fleek-context)
  - Boolean - if true, the ctx will be cloned and returned. defaults to false, and updates in place
- Returns
  - Object - updated context

### Example

```javascript
ctx.request.body = { name: 'foo' };

validator.ctx(ctx);
validator.ctx(ctx, {
  parameters: [{
    name: "user",
    in: "body",
    schema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", uppercase: true }
      }
    }
  }]
});

let newCtx = validator.ctx(ctx, null, true);

console.log(newCtx); // => {
//   passed: false,
//   failed: true,
//   errors: [{
//     name: 'VALUE.UPPERCASE'
//     code: 207,
//     message: 'Must be uppercase',
//     parameter : { name: 'user.name' type: 'string', uppercase: true }
//   }]
// }
// }
```

## Object

- Accepts
  - Mixed - value to be validated
  - Object - swagger object definition
- Returns
  - Either
    - Mixed - normalized result of the validations
    - Error - error containing `.errors` list of validation errors

### Example

```javascript
let result = validator.object({ name: 'FOO' }, { name: { type: 'string', uppercase: true } });
console.log(result); // => { name: 'FOO' }
let result = validator.object({ name: 'foo' }, { name: { type: 'string', toUpperCase: true } });
console.log(result); // => { name: 'FOO' }
let result = validator.object({ name: 'foo' }, { name: { type: 'string', uppercase: true } });
console.log(result); // => {
//   message 'Validation failed',
//   errors: [{
//     name: 'VALUE.UPPERCASE'
//     code: 207,
//     message: 'Must be uppercase',
//     parameter : { type: 'string', uppercase: true }
//   }]
// }
```

## One

- Accepts
  - Mixed - value to be validated
  - Object - swagger parameter definition
- Returns
  - Either
    - Mixed - normalized result of the validations
    - ValidationError - validation error

### Example

```javascript
let result = validator.one('FOO', { type: 'string', uppercase: true });
console.log(result); // => 'FOO'
let result = validator.one('foo', { type: 'string', toUpperCase: true });
console.log(result); // => 'FOO'
let result = validator.one('foo', { type: 'string', uppercase: true });
console.log(result); // => {
//   name: 'VALUE.UPPERCASE'
//   code: 207,
//   message: 'Must be uppercase',
//   parameter : { type: 'string', uppercase: true }
// }
```

# Normalizations

#### `default`
  - Expect: [Boolean]
  - Type: [Mixed]
  - Action: if the value is not defined, set it to the default
  - Note: First action taken in order of operations
#### `trim`
  - Expect: [Boolean]
  - Type: [String]
  - Action: trim whitespace
#### `toUpperCase`
  - Expect: [Boolean]
  - Type: [String]
  - Action: convert to uppercase
#### `toLowerCase`
  - Expect: [Boolean]
  - Type: [String]
  - Action: convert to uppercase

# Validations

#### `required`
  - Expect: [Boolean]
  - Type: [String]
  - Action: reject undefined
  - Note: Second action taken in order of operations, after default
#### `type`
  - Expect: [String]
  - Type: [Mixed]
  - Action: reject the value if it does not match the expected type
#### `maxItems`
  - Expect: [Integer]
  - Type: [Array]
  - Action: rejects an array with more than the expected max
#### `minItems`
  - Expect: [Integer]
  - Type: [Array]
  - Action: rejects an array with fewer than the expected min
#### `uniqueItems`
  - Expect: [Boolean]
  - Type: [Array]
  - Action: reject an array with duplicate items
#### `multipleOf`
  - Expect: [Integer]
  - Type: [Number]
  - Action: reject a number thats not a multiple of the expected integer
#### `maximum`
  - Expect: [Integer]
  - Type: [Number]
  - Action: reject a number thats above the expected max
#### `exclusiveMaximum`
  - Expect: [Integer]
  - Type: [Number]
  - Action: reject a number thats above or equal to the expected max
#### `minimum`
  - Expect: [Integer]
  - Type: [Number]
  - Action: reject a number thats below the expected min
#### `exclusiveMinimum`
  - Expect: [Integer]
  - Type: [Number]
  - Action: reject a number thats below or equal to the expected min
#### `maxProperties`
  - Expect: [Integer]
  - Type: [Object]
  - Action: reject an object with more than the expected max number of properties
#### `minProperties`
  - Expect: [Integer]
  - Type: [Object]
  - Action: reject an object with fewer than the expected min number of properties
#### `email`
  - Expect: [Boolean]
  - Type: [String]
  - Action: reject a string that is not a valid email
#### `alphanumeric`
  - Expect: [Boolean]
  - Type: [String]
  - Action: reject a non-alphanumeric string
#### `lowercase`
  - Expect: [Boolean]
  - Type: [String]
  - Action: reject a string containing uppercase characters
#### `uppercase`
  - Expect: [Boolean]
  - Type: [String]
  - Action: reject a string containing lowercase characters
#### `minLength`
  - Expect: [Integer]
  - Type: [String]
  - Action: reject a string of length below the expected length
#### `maxLength`
  - Expect: [Integer]
  - Type: [String]
  - Action: reject a string of length above the expected length
#### `pattern`
  - Expect: [RegExp String]
  - Type: [String]
  - Action: reject a string that doesnt pass the rejex
#### `enum`
  - Expect: [Array]
  - Type: [Mixed]
  - Action: reject any value not listed in the enumeration

## Authors

- [John Hofrichter](https://github.com/johnhof)

_Built and maintained with [<img width="15px" src="http://hart.com/wp-content/themes/hart/img/hart_logo.svg">](http://hart.com/) by the [Hart](http://hart.com/) team._
