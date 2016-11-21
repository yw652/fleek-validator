'use strict';

const mocha = require('co-mocha');
const expect = require('chai').expect;

const Validator = require('../lib/validator');
const SWAGGER = require('./swagger.json');
const CTX = require('./ctx');

describe('Validator', () => {
  describe('Constructor', () => {
    it('should initialize with a swagger object', () => {
      let validator = new Validator();
      expect(validator).instanceof(Validator);
    });
    // it('should error if swagger is not provided, or malphormed', () => {
    //   expect(() => new Validator()).to.throw(Error);
    //   expect(() => new Validator({})).to.throw(Error);
    // });
  });
  describe('ctx', () => {
    it('should ignore requests with no fleek context', () => {
      let validator = new Validator();
      console.log(validator.ctx({}));
    });
    it('should return success for requests passing validation', () => {
      let validator = new Validator();
      let ctx = CTX.post('/user/create')
                    .context(SWAGGER.paths['/user/create'].post)
                    .body({
                      email: 'test@testing.com',
                      primary_phone: '1112223333',
                      birthdate: '01/01/1991',
                      name: {
                        first: 'john',
                        last: 'hof'
                      }
                    });
      console.log(validator.ctx(ctx));
    });
    it('should return error for requests failing validation', () => {
      let validator = new Validator();
      console.log(validator.ctx(new CTX()));
    });
  });
  describe('object', () => {
    it('should ignore requests with no fleek context', () => {
      let validator = new Validator();
      console.log(validator.ctx(new CTX()));
    });
    it('should return success for requests passing validation', () => {
      let validator = new Validator();
      console.log(validator.ctx(new CTX()));
    });
    it('should return error for requests failing validation', () => {
      let validator = new Validator();
      console.log(validator.ctx(new CTX()));
    });
  });
  describe('one', () => {
    it('should ignore requests with no fleek context', () => {
      let validator = new Validator();
      console.log(validator.ctx(new CTX()));
    });
    it('should return success for requests passing validation', () => {
      let validator = new Validator();
      console.log(validator.ctx(new CTX()));
    });
    it('should return error for requests failing validation', () => {
      let validator = new Validator();
      console.log(validator.ctx(new CTX()));
    });
  });
});
