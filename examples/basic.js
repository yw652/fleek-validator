'use strict'

let koa       = require('koa');
let validator = require('../lib/validator');
let parser    = require('koa-bodyparser');
let app       = koa();

const PORT = 7000;

app.use(parser());

let config = {
  swagger : './swagger.json'
}

validator(app, config);
// OR
// app.use(validator(config));

app.use(function *() {
  this.body = { message : 'validation passed' };
});

app.listen(PORT);
console.log('Listening on port ' + PORT)
