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
  // describe('ctx', () => {
  //   it('should ignore requests with no fleek context', () => {
  //     let validator = new Validator();
  //     console.log(validator.ctx({}));
  //   });
  //   it('should return succeed for requests passing validation', () => {
  //     let validator = new Validator();
  //     let ctx = CTX.post('/user/create')
  //                   .context(SWAGGER.paths['/user/create'].post)
  //                   .body({
  //                     email: 'test@testing.com',
  //                     primary_phone: '1112223333',
  //                     birthdate: '01/01/1991',
  //                     name: {
  //                       first: 'john',
  //                       last: 'hof'
  //                     }
  //                   });
  //   });
  //   it('should return error for requests failing validation', () => {
  //     let validator = new Validator();
  //   });
  // });
  // describe('object', () => {
  //   it('should ignore requests with no fleek context', () => {
  //     let validator = new Validator();
  //   });
  //   it('should return success for requests passing validation', () => {
  //     let validator = new Validator();
  //   });
  //   it('should return error for requests failing validation', () => {
  //     let validator = new Validator();
  //   });
  // });
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
