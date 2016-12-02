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
});
