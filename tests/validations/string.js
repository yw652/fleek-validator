'use strict';

const mocha = require('co-mocha');
const expect = require('chai').expect;

const validations = require('../../lib/validations');
const ValError = require('../../lib/error');

describe('Validations - String', () => {
  describe('maxLength', () => {
    it('should accept string length below or equal to max', () => {
      expect(validations.maxLength('12', { maxLength: 3 })).to.equal('12');
      expect(validations.maxLength('123', { maxLength: 3 })).to.equal('123');
    });
    it('should reject string length above max', () => {
      expect(validations.maxLength('1234', { maxLength: 3 })).instanceof(ValError);
    });
  });

  describe('maxLength', () => {
    it('should accept string length below or equal to max', () => {
      expect(validations.maxLength('123', { maxLength: 3 })).to.equal('123');
      expect(validations.maxLength('12', { maxLength: 3 })).to.equal('12');
    });
    it('should reject string length above max', () => {
      expect(validations.maxLength('1234', { maxLength: 3 })).instanceof(ValError);
    });
  });

  describe('email', () => {
    it('should accept email string', () => {
      expect(validations.email('john.tester@blackhole.com', { email: true })).to.equal('john.tester@blackhole.com');
    });
    it('should reject non-email string', () => {
      expect(validations.email('', { email: true })).instanceof(ValError);
    });
  });

  describe('alphanumeric', () => {
    it('should accept alphanumeric string', () => {
      expect(validations.alphanumeric('abc', { alphanumeric: true  })).to.equal('abc');
      expect(validations.alphanumeric('123', { alphanumeric: true  })).to.equal('123');
      expect(validations.alphanumeric('abc123', { alphanumeric: true  })).to.equal('abc123');
    });
    it('should reject alphanumeric string', () => {
      expect(validations.alphanumeric('abc 123', { alphanumeric: true  })).instanceof(ValError);
      expect(validations.alphanumeric('@abc', { alphanumeric: true  })).instanceof(ValError);
    });
  });

  describe('lowercase', () => {
    it('should accept  lowercase string', () => {
      expect(validations.lowercase('abc', { lowercase: true  })).to.equal('abc');
    });
    it('should reject mixed case string', () => {
      expect(validations.lowercase('aBc', { lowercase: true })).instanceof(ValError);
    });
  });

  describe('uppercase', () => {
    it('should accept uppercase string', () => {
      expect(validations.uppercase('ABC', { uppercase: true  })).to.equal('ABC');
    });
    it('should reject string', () => {
      expect(validations.uppercase('AbC', { uppercase: true })).instanceof(ValError);
    });
  })

  describe('pattern', () => {
    it('should accept string matching regular expression', () => {
      expect(validations.pattern('ABC1!', { pattern: '[a-bzA-Z]+.!$'  })).to.equal('ABC1!');
    });
    it('should reject string not matching regular expression', () => {
      expect(validations.pattern('ABC!1', { pattern: '[a-zA-Z]+.!$' })).instanceof(ValError);
    });
  });;
});
