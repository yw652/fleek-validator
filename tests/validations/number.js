'use strict';

const mocha = require('co-mocha');
const expect = require('chai').expect;

const validations = require('../../lib/validations');
const ValError = require('../../lib/error');

describe('Validations - Number', () => {
  describe('multipleOf', () => {
    it('should accept multiple', () => {
      expect(validations.multipleOf(9, { multipleOf: 3 })).to.equal(9);
      expect(validations.multipleOf(21, { multipleOf: 3 })).to.equal(21);
    });
    it('should reject non-multiple', () => {
      expect(validations.multipleOf(7, { multipleOf: 3 })).instanceof(ValError);
    });
  });
  describe('maximum', () => {
    it('should accept a value less than or equal to the max', () => {
      expect(validations.maximum(4, { maximum: 5 })).to.equal(4);
      expect(validations.maximum(5, { maximum: 5 })).to.equal(5);
    });
    it('should reject a value greater than the max', () => {
      expect(validations.maximum(6, { maximum: 5 })).instanceof(ValError);
    });
  });
  describe('exclusiveMaximum', () => {
    it('should accept a value less than the max', () => {
      expect(validations.exclusiveMaximum(4, { exclusiveMaximum: 5 })).to.equal(4);
    });
    it('should reject a value greater than or equal to the max', () => {
      expect(validations.exclusiveMaximum(5, { exclusiveMaximum: 5 })).instanceof(ValError);
      expect(validations.exclusiveMaximum(6, { exclusiveMaximum: 5 })).instanceof(ValError);
    });
  });
  describe('minimum', () => {
    it('should accept a value less than or equal to the max', () => {
      expect(validations.minimum(5, { minimum: 5 })).to.equal(5);
      expect(validations.minimum(6, { minimum: 5 })).to.equal(6);
    });
    it('should reject a value less than the min', () => {
      expect(validations.minimum(4, { minimum: 5 })).instanceof(ValError);
    });
  });
  describe('exclusiveMinimum', () => {
    it('should accept a value less than the min', () => {
      expect(validations.exclusiveMinimum(6, { exclusiveMinimum: 5 })).to.equal(6);
    });
    it('should reject a value less than or equal to the min', () => {
      expect(validations.exclusiveMinimum(5, { exclusiveMinimum: 5 })).instanceof(ValError);
      expect(validations.exclusiveMinimum(4, { exclusiveMinimum: 5 })).instanceof(ValError);
    });
  });
});
