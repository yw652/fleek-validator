'use strict'

let koa = require('koa');
let validator = require('../lib/validator');
let router = require('fleek-router');
let parser = require('koa-bodyparser');
let app = module.exports = koa();

const PORT = 7000;

app.use(parser());

let config = {
    swagger: './swagger.json',
    controllers : '.',
    validate: validator({
        swagger: './swagger.json',
        success: function *(next) {
            this.set('X-fleek-validation', 'OK');
        },
        error: function *(err, next) {
            this.set('X-fleek-validation', 'KO');
            this.body = err;
            this.status = 400;
        }
    })
}

router(app, config);

if (!module.parent) {
    app.listen(PORT);
    console.log('Listening on port ' + PORT)
}
