'use strict';

const mocha = require('co-mocha');
const expect = require('chai').expect;

const Validator = require('../lib/validator');
const normalizations = require('../lib/normalizations');
const ValError = require('../lib/error');
const SWAGGER = require('./swagger.json');
const CTX = require('./ctx');

describe('Normalizations', () => {
  describe('trim', () => {
    it('should trim whitespace', () => {
      let str = '  test  ';
      let result = normalizations.trim(str, { trim: true });
      expect(result).to.equal(str.trim());
      expect(normalizations.trim(result, { trim: true })).to.equal(result);
    });
  });
  describe('toUpperCase', () => {
    it('should convert string to upper case', () => {
      let str = 'test';
      let result = normalizations.toUpperCase(str, { toUpperCase: true });
      expect(result).to.equal(str.toUpperCase());
      expect(normalizations.toUpperCase(result, { toUpperCase: true })).to.equal(result);
    });
  });
  describe('toLowerCase', () => {
    it('should convert string to lower case', () => {
      let str = 'test';
      let result = normalizations.toLowerCase(str, { toUpperCase: true });
      expect(result).to.equal(str.toLowerCase());
      expect(normalizations.toLowerCase(result, { toUpperCase: true })).to.equal(result);
    });
  });
});
