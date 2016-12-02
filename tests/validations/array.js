'use strict';

const mocha = require('co-mocha');
const expect = require('chai').expect;

const validations = require('../../lib/validations');
const ValError = require('../../lib/error');

describe('Validations - Array', () => {
  describe('maxItems', () => {
    it('should accept array length below or equal to max', () => {
      let equal = [1,2,3];
      let below = [1,2];
      expect(validations.maxItems(equal, { maxItems: 3 })).to.equal(equal);
      expect(validations.maxItems(below, { maxItems: 3 })).to.equal(below);
    });
    it('should reject array length above max', () => {
      expect(validations.maxItems([1,2,3,4], { maxItems: 3 })).instanceof(ValError);
    });
  });

  describe('minItems', () => {
    it('should accept array length above or equal to the min', () => {
      let equal = [1,2,3];
      let above = [1,2,3,4];
      expect(validations.minItems(equal, { minItems: 3 })).to.equal(equal);
      expect(validations.maxItems(above, { minItems: 3 })).to.equal(above);
    });
    it('should reject array length below the min', () => {
      expect(validations.minItems([1,2], { minItems: 3 })).instanceof(ValError);
    });
  })

  describe('uniqueItems', () => {
    it('should accept array length below or equal to max', () => {
      let ints = [1,2,3];
      let strings = ['1','2','3'];
      let objs = [{ '1': true }, { '2': true }, { '3': true }];
      expect(validations.uniqueItems(ints)).to.equal(ints);
      expect(validations.uniqueItems(strings)).to.equal(strings);
      expect(validations.uniqueItems(objs)).to.equal(objs);
    });
    it('should reject array length above max', () => {
      expect(validations.uniqueItems([1,2,2])).instanceof(ValError);
      expect(validations.uniqueItems(['1', '3', '3', '4'])).instanceof(ValError);
      expect(validations.uniqueItems([{ '3': true }, { '2': true }, { '3': true}])).instanceof(ValError);
    });
  });;
});
