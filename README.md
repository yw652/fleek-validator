# Fleek Validator

Middleware router that validates request against swagger doc specifications.

Quick reference:
- A request may pass erroneously pass validation if the route is not recognized or the configuration is not correct. if no validation is run `this.validated` will be `false`

anything not using fleek-validator must use koa router! (or a router with identical templating)

# NOTHING BELOW THIS LINE IS ACCURATE

## Key

- [Usage](#usage)
  - [Basic](#basic)
  - [Fully Custom (paths)](#fully-custom-paths)
  - [Fully Custom (objects)](#fully-custom-objects)
  - [Koa on Fleek](#koa-on-fleek)
- [Configuration](#configuration)
  - [`config.swagger`](#configswagger)
  - [`config.success`](#configsuccess)
  - [`config.error`](#configerror)
  - [`config.strict`](#configstrict) fail routes not in swagger docs
- [Authors](#authors)

## Usage

### Basic

- Controllers are pulled from the `./controllers` directory
- Swagger docs will be retrieved from `./api.json`, `/swagger.json`, `/config/api.json`, or `/config/swagger.json` in that order
- [**TODO** Full example]()

```javascript
var koa         = require('koa');
var fleekRouter = require('fleek-router');
var app = koa();

fleekRouter(app);

app.listen(3000);
```

### Fully Custom (paths)

- Controllers are pulled from the `./custom/controllers` directory
- Swagger docs are pulled from `./custom/docs.json`
- [**TODO** Full example]()

```javascript
var koa         = require('koa');
var fleekRouter = require('fleek-router');
var app = koa();

fleekRouter(app, {
  controllers : './controllers',
  swagger      : './custom/docs.json'
  authenicate : require('./some_auth_middleware'),
  validate    : require('./some_val_middleware')
});

app.listen(3000);
```

### Fully custom (objects)

- Controllers are mapped to the object
- Swagger docs are parsed from the object provided
- [**TODO** Full example]()

```javascript
var koa         = require('koa');
var fleekRouter = require('fleek-router');
var app = koa();

fleekRouter(app, {
  authenicate : require('./some/auth/middleware'),
  validate    : require('./some/val/middleware')
  swagger      : require(./some/swagger/generator)(),
  controllers : {
    foo : function () {
      this.body = { success: true };
    }
  }
});

app.listen(3000);
```

### Koa on fleek

- Controllers are pulled from the `./controllers` directory
- Swagger docs will be retrieved from `./api.json`, `/swagger.json`, `/config/api.json`, or `/config/swagger.json` in that order
- validate and authenticate will use the fleek middleware
- [**TODO** Full example]()

```javascript
var koa         = require('koa');
var fleekRouter = require('fleek-router');
var app = koa();

fleekRouter(app, {
  authenicate : true,
  validate    : true
});

app.listen(3000);
```

## Configuration


### config.swagger

#### [required]

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




## Authors

- [John Hofrichter](https://github.com/johnhof)
- [Peter A. Tariche](https://github.com/ptariche)
