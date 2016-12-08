'use strict';

const mocha = require('co-mocha');
const expect = require('chai').expect;

const Validator = require('../lib/validator');
const ValErr = require('../lib/error');
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
    let validator = new Validator();
    it('should ignore requests with no fleek context', () => {
      let result = validator.ctx({}, null, true);
      expect(result.fleek.validation).to.be.false;
    });
    it('should return succeed for requests passing validation', () => {
      let ctx = CTX.post('/user/create')
                    .context(SWAGGER.paths['/user/create'].post)
                    .body({
                      email: 'john.tester@blackhole.com',
                      primary_phone: '1231231231',
                      birthdate: '01/01/1991',
                      ssn: 213121234,
                      height: 1.8,
                      gender: 'M',
                      nicknames: ['jack'],
                      enable_notifications: true,
                      deadline: '2025-12-05T22:57:56+00:00',
                      name: {
                        first: 'john',
                        last: 'tester'
                      }
                    });
      let result = validator.ctx(ctx, null, true);
      expect(result.body).to.deep.equal(ctx.body);
      expect(result.fleek.validation).to.be.an('object');
      expect(result.fleek.validation.passed).to.be.true;
      expect(result.fleek.validation.failed).to.be.false;
      expect(result.fleek.validation.errors).to.have.length(0);
    });
    it('should return error for requests failing validation', () => {
      let ctx = CTX.post('/user/create')
                    .context(SWAGGER.paths['/user/create'].post)
                    .body({
                      email: 'john.tester@blackhole.com', // Errors:
                    //primary_phone: '1231231231',        // 0
                      birthdate: '13/13/2013',            // 1
                      height: '1.8',                      // 2
                      gender: 'T',                        // 3
                      nicknames: 'jack',                  // 4
                      enable_notifications: 'nope',       // 5
                      deadline: '2025-12',                // 6
                      name: {
                        first: 1,                         // 7
                        last: true                        // 8
                      }
                    });
      let result = validator.ctx(ctx, null, true);
      expect(result.body).to.deep.equal(ctx.body);
      expect(result.fleek.validation).to.be.an('object');
      expect(result.fleek.validation.passed).to.be.false;
      expect(result.fleek.validation.failed).to.be.true;
      expect(result.fleek.validation.errors).to.have.length(8);
    });
  });

  describe('object', () => {
    let validator = new Validator();
    it('should return success for objects passing validation', () => {
      let val = {
        email: 'john.tester@blackhole.com',
        primary_phone: '1231231231',
        birthdate: '01/01/1991',
        ssn: 213121234,
        height: 1.8,
        gender: 'M',
        nicknames: ['jack'],
        enable_notifications: true,
        deadline: '2025-12-05T22:57:56+00:00',
        name: {
          first: 'john',
          last: 'tester'
        }
      };
      let result = validator.object(val, SWAGGER.definitions.user);
      val.secondary_phone = undefined; // hackiness from undefined default
      expect(result).to.deep.equal(val);
    });
    it('should return errors for objects failing validation', () => {
      let val = {};
      let result = validator.object(val, SWAGGER.definitions.user);
      expect(result).instanceof(Error);
      expect(result.errors).to.have.length.above(0);
      for (let err of result.errors) expect(err).instanceof(ValErr);
    });
    it('should return updated object if normalizations are used', () => {
      let val = {
        email: 'john.TESTER@blackhole.com',
        primary_phone: '1231231231',
        birthdate: '01/01/1991',
        ssn: 213121234,
        height: 1.8,
        gender: 'M',
        nicknames: ['jack'],
        deadline: '2025-12-05T22:57:56+00:00',
        name: {
          first: 'JOHN',
          last: 'tester'
        }
      };
      let result = validator.object(val, SWAGGER.definitions.user);
      expect(result.email).to.not.equal(val.email);
      expect(result.email).to.equal(val.email.toLowerCase());
      expect(result.name.first).to.not.equal(val.name.first);
      expect(result.name.first).to.equal(val.name.first.toLowerCase());
      delete result.enable_notifications;
      delete result.email;
      delete val.email;
      delete result.name.first;
      delete val.name.first;
      val.secondary_phone = undefined; // hackiness from undefined default
      expect(result).to.deep.equal(val);
    });
  });

  describe('one', () => {
    let param = () => { return { required: true, email: true, type: 'string' }; };
    let validator = new Validator();
    it('should return the value if using validations pass', () => {
      let val = 'test@blackhole.com';
      let result = validator.one(val, param());
      expect(result).to.equal(val);
    });
    it('should return a ValidationError if validation fails', () => {
      let val = 'testblackhole.com';
      let result = validator.one(val, param());
      expect(result).instanceof(ValErr);
    });
    it('should return an updates value if a normalization is used', () => {
      let val = 'TeSt@BlAcKhOlE.cOm';
      let parameter = param();
      parameter.toLowerCase = true;
      let result = validator.one(val, parameter);
      expect(result).to.equal(val.toLowerCase());
    });
  });
});
