'use strict';

const mocha = require('co-mocha');
const expect = require('chai').expect;

const Validator = require('../lib/middleware');
const ValErr = require('../lib/error');
const SWAGGER = require('./swagger.json');
const CTX = require('./ctx');

describe('Middleware', () => {
  describe('initialize', () => {
    it('should return a function which accepts [ctx, next] and returns a promise', () => {
      let middleware = Validator();
      expect(middleware).to.be.a('function');
      expect(middleware({}, () => Promise.resolve())).to.be.a('promise');
    });
    describe('options', () => {
      describe('throw', () => {
        it('should reject the middleware promise on validation failure, if true or not set', (done) => {
          let middleware = Validator();
          let ctx = CTX.post('/user/create').context(SWAGGER.paths['/user/create'].post)
          middleware(ctx, (_ctx, next) => done(Error('Validation failed, but was not rejected')))
            .then(() => done(Error('Validation failed, but was not rejected')))
            .catch((e) => {
              try {
                expect(e).instanceof(Error);
                expect(e.errors).to.have.length.above(0);
                done();
              } catch(err) { done(err); }
            });
        });
        it('should resolve the middleware promise on validation failure if set to false', (done) => {
          let middleware = Validator({ throw: false });
          let ctx = CTX.post('/user/create').context(SWAGGER.paths['/user/create'].post)
          middleware(ctx, (_ctx, next) => {
            let validation = ctx.fleek.validation;
            expect(validation.passed).to.be.false;
            expect(validation.failed).to.be.true;
            expect(validation.errors).to.have.length.above(0);
            done();
          });
        });
      });
      describe('catch', () => {
        let expectCtxFailure = (done) => (ctx, next) => {
          let validation = ctx.fleek.validation;
          expect(validation.passed).to.be.false;
          expect(validation.failed).to.be.true;
          expect(validation.errors).to.have.length.above(0);
          done();
        };
        it('should allow catch funciton in options', (done) => {
          let middleware = Validator({ catch: expectCtxFailure(done) });
          let ctx = CTX.post('/user/create').context(SWAGGER.paths['/user/create'].post);
          middleware(ctx, () => done(Error('Failed validation continued down middleware')));
        });
        it('should allow catch funciton to be chained', (done) => {
          let middleware = Validator().catch(expectCtxFailure(done));
          let ctx = CTX.post('/user/create').context(SWAGGER.paths['/user/create'].post);
          middleware(ctx, () => done(Error('Failed validation continued down middleware')));
        });
        it('should prioritize catch over throw', (done) => {
          let middleware = Validator({ throw: true }).catch(expectCtxFailure(done));
          let ctx = CTX.post('/user/create').context(SWAGGER.paths['/user/create'].post);
          middleware(ctx, () => done(Error('Failed validation continued down middleware')));
        });
        it('should allow continueing despite calling catch', (done) => {
          let middleware = Validator().catch((ctx, next) => next(ctx, next));
          let ctx = CTX.post('/user/create').context(SWAGGER.paths['/user/create'].post);
          middleware(ctx, expectCtxFailure(done));
        });
      });
    });
  });
});
