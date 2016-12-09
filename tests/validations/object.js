'use strict';

const mocha = require('co-mocha');
const expect = require('chai').expect;

const validations = require('../../lib/validations');
const ValError = require('../../lib/error');

describe('Validations - Object', () => {
  describe('maxProperties', () => {
    it('should accept object property count below or equal to max', () => {
      let equal = { '1': true, '2': true, '3': true, };
      let below = { '1': true, '2': true, };
      expect(validations.maxProperties(equal, { maxProperties: 3 })).to.equal(equal);
      expect(validations.maxProperties(below, { maxProperties: 3 })).to.equal(below);
    });
    it('should reject object property count above max', () => {
      expect(validations.maxProperties({ '1': true, '2': true, '3': true, }, { maxProperties: 2 })).instanceof(ValError);
    });
  });

  describe('minProperties', () => {
    it('should accept object property count above or equal to min', () => {
      let above = { '1': true, '2': true, '3': true, };
      let equal = { '1': true, '2': true, };
      expect(validations.minProperties(equal, { minProperties: 2 })).to.equal(equal);
      expect(validations.minProperties(above, { minProperties: 2 })).to.equal(above);
    });
    it('should reject object property count above min', () => {
      expect(validations.minProperties({ '1': true, }, { minProperties: 2 })).instanceof(ValError);
    });
  });
});
