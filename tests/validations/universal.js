'use strict';

const mocha = require('co-mocha');
const expect = require('chai').expect;
const moment = require('moment');

const validations = require('../../lib/validations');
const ValError = require('../../lib/error');

describe('Validations - Universal', () => {
  describe('required', () => {
    it('should accept any value', () => {
      let vals = [1, 'test', {}, []];
      for (let val of vals) {
        expect(validations.required(val)).to.equal(val);
      }
    });
    it('should reject undefined', () => {
      expect(validations.required(undefined)).instanceof(ValError);
    });
  });

  describe('type', () => {
    let should = {
      pass (type, ...vals) {
        return () => {
          for (let val of vals) expect(validations.type(val, { type: type })).to.equal(val);
        }
      },
      fail (type, ...vals) {
        return () => {
          for (let val of vals) expect(validations.type(val, { type: type })).instanceof(ValError);
        }
      }
    };

    describe('string', () => {
      it('should accept a string', should.pass('string', 'test'));
      it('should reject any non string', should.fail('string', {}, 0, 10, true));
    });
    describe('array', () => {
      it('should accept an array', should.pass('array', ['test']));
      it('should reject any non array', should.fail('array', {}, 0, 10, true, 'test'));
    });
    describe('object', () => {
      it('should accept a object', should.pass('object', { test: 'foo' }));
      it('should reject any non object', should.fail('object', [], 0, 10, true, 'test'));
    });
    describe('integer', () => {
      it('should accept an integer', should.pass('integer', 0, 5, 10, 10000));
      it('should reject any non integer', should.fail('integer', [], {}, true, 'test'));
    });
    describe('datetime', () => {
      it('should accept a datetime', should.pass('datetime', moment().toISOString()));
      it('should reject any non datetime', should.fail('datetime', [], 0, 10, true, 'test'));
    });
    describe('long', () => {
      it('should accept a long', should.pass('long', 10.0, 0.0, 0, 1));
      it('should reject any non long', should.fail('long', [], true, 'test'));
    });
    describe('float', () => {
      it('should accept a float', should.pass('long', 10.0, 0.0, 0, 1));
      it('should reject any non float', should.fail('long', [], true, 'test'));
    });
    describe('double', () => {
      it('should accept a double', should.pass('long', 10.0, 0.0, 0, 1));
      it('should reject any non double', should.fail('long', [], true, 'test'));
    });
    describe('boolean', () => {
      it('should accept a boolean', () => {
        expect(validations.type(true, { type: 'boolean' })).to.equal(true);
        expect(validations.type('true', { type: 'boolean' })).to.equal(true);
        expect(validations.type('1', { type: 'boolean' })).to.equal(true);
        expect(validations.type(1, { type: 'boolean' })).to.equal(true);
        expect(validations.type(false, { type: 'boolean' })).to.equal(false);
        expect(validations.type('false', { type: 'boolean' })).to.equal(false);
        expect(validations.type('0', { type: 'boolean' })).to.equal(false);
        expect(validations.type(0, { type: 'boolean' })).to.equal(false);
      });
      it('should reject any non boolean', should.fail('boolean', [], 10, {}, 'test'));
    });
  });

  describe('enum', () => {
    it('should accept an enumerated value of any kind', () => {
      let vals = [1, 'test', null];
      for (let val of vals) {
        expect(validations.enum(val, { enum: [1, 'test', null, 10, 'hello'] })).to.equal(val);
      }
    });
    it('should reject any value not enumerated', () => {
      expect(validations.enum(11, [1, 'test', null, 10, 'hello'])).instanceof(ValError);
      expect(validations.enum(true, [1, 'test', null, 10, 'hello'])).instanceof(ValError);
    });
  });
});
