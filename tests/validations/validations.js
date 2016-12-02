// 'use strict';
//
// const mocha = require('co-mocha');
// const expect = require('chai').expect;
// const moment = require('moment');
//
// const validations = require('../../lib/validations');
// const ValError = require('../../lib/error');
//
// describe('Validations', () => {
//   describe('required', () => {
//     it('should accept any value', () => {
//       let vals = [1, 'test', {}, []];
//       for (let val of vals) {
//         expect(validations.required(val)).to.equal(val);
//       }
//     });
//     it('should reject undefined', () => {
//       expect(validations.required(undefined)).instanceof(ValError);
//     });
//   });
//
//   describe('type', () => {
//     let should = {
//       pass (type, ...vals) {
//         return () => {
//           for (let val of vals) expect(validations.type(val, { type: type })).to.equal(val);
//         }
//       },
//       fail (type, ...vals) {
//         return () => {
//           for (let val of vals) expect(validations.type(val, { type: type })).instanceof(ValError);
//         }
//       }
//     };
//
//     describe('string', () => {
//       it('should accept a string', should.pass('string', 'test'));
//       it('should reject any non string', should.fail('string', {}, 0, 10, true));
//     });
//     describe('array', () => {
//       it('should accept an array', should.pass('array', ['test']));
//       it('should reject any non array', should.fail('array', {}, 0, 10, true, 'test'));
//     });
//     describe('object', () => {
//       it('should accept a object', should.pass('object', { test: 'foo' }));
//       it('should reject any non object', should.fail('object', [], 0, 10, true, 'test'));
//     });
//     describe('integer', () => {
//       it('should accept an integer', should.pass('integer', 0, 5, 10, 10000));
//       it('should reject any non integer', should.fail('integer', [], {}, true, 'test'));
//     });
//     describe('datetime', () => {
//       it('should accept a datetime', should.pass('datetime', moment().toISOString()));
//       it('should reject any non datetime', should.fail('datetime', [], 0, 10, true, 'test'));
//     });
//     describe('long', () => {
//       it('should accept a long', should.pass('long', 10.0, 0.0, 0, 1));
//       it('should reject any non long', should.fail('long', [], true, 'test'));
//     });
//     describe('float', () => {
//       it('should accept a float', should.pass('long', 10.0, 0.0, 0, 1));
//       it('should reject any non float', should.fail('long', [], true, 'test'));
//     });
//     describe('double', () => {
//       it('should accept a double', should.pass('long', 10.0, 0.0, 0, 1));
//       it('should reject any non double', should.fail('long', [], true, 'test'));
//     });
//     describe('boolean', () => {
//         it('should accept a boolean', () => {
//           expect(validations.type(true, { type: 'boolean' })).to.equal(true);
//           expect(validations.type('true', { type: 'boolean' })).to.equal(true);
//           expect(validations.type('1', { type: 'boolean' })).to.equal(true);
//           expect(validations.type(1, { type: 'boolean' })).to.equal(true);
//           expect(validations.type(false, { type: 'boolean' })).to.equal(false);
//           expect(validations.type('false', { type: 'boolean' })).to.equal(false);
//           expect(validations.type('0', { type: 'boolean' })).to.equal(false);
//           expect(validations.type(0, { type: 'boolean' })).to.equal(false);
//         });
//         it('should reject any non boolean', should.fail('boolean', [], 10, {}, 'test'));
//     });
//     describe('date', () => {
//       it('should accept a date', should.pass('date', '01/01/1991', '12/12/2012'));
//       it('should reject any non date', should.fail('date', [], 0, 10, true, 'test', '13/13/2013'));
//       it('should allow future restriction', () => {
//         let future = '01/01/2050';
//         let past = '01/01/1991';
//         expect(validations.type(future, { type: 'date', future: true})).to.equal(future);
//         expect(validations.type(past, { type: 'date', future: true})).instanceof(ValError);
//       });
//       it('should allow past restriction', () => {
//         let future = '01/01/2050';
//         let past = '01/01/1991';
//         expect(validations.type(past, { type: 'date', past: true})).to.equal(past);
//         expect(validations.type(future, { type: 'date', past: true})).instanceof(ValError);
//       });
//       it('should allow custom date format', () => {
//         let valid = '2050 01 01';
//         let invalid = '01/01/1991';
//         let format = 'YYYY MM DD';
//         expect(validations.type(valid, { type: 'date', format: format})).to.equal(valid);
//         expect(validations.type(invalid, { type: 'date', format: format})).instanceof(ValError);
//       });
//       it('should allow non-strict date validation', () => {
//         let valid = '01/01/1991';
//         let validish = '01-01-1991';
//         expect(validations.type(valid, { type: 'date', strict: false })).to.equal(valid);
//         expect(validations.type(validish, { type: 'date', strict: false })).to.equal(validish);
//       });
//     });
//   });
//
//   describe('number', () => {
//     describe('maxLength', () => {
//       it('should accept string length below or equal to max', () => {
//         expect(validations.maxLength('12', { maxLength: 3 })).to.equal('12');
//         expect(validations.maxLength('123', { maxLength: 3 })).to.equal('123');
//       });
//       it('should reject string length above max', () => {
//         expect(validations.maxLength('1234', { maxLength: 3 })).instanceof(ValError);
//       });
//     });
//
//     describe('maxItems', () => {
//       it('should accept array length below or equal to max', () => {
//         let equal = [1,2,3];
//         let below = [1,2];
//         expect(validations.maxItems(equal, { maxItems: 3 })).to.equal(equal);
//         expect(validations.maxItems(below, { maxItems: 3 })).to.equal(below);
//       });
//       it('should reject array length above max', () => {
//         expect(validations.maxItems([1,2,3,4], { maxItems: 3 })).instanceof(ValError);
//       });
//     });
//
//     describe('minLength', () => {
//       it('should accept string length above or equal to min', () => {
//         expect(validations.minLength('123', { minLength: 3 })).to.deep.equal('123');
//         expect(validations.minLength('1234', { minLength: 3 })).to.equal('1234');
//       });
//       it('should reject string length below min', () => {
//         expect(validations.minLength('12', { minLength: 3 })).instanceof(ValError);
//       });
//     });
//
//     describe('minItems', () => {
//       it('should accept array length above or equal to min', () => {
//         let equal = [1,2,3];
//         let above = [1,2,3,4];
//         expect(validations.minItems(equal, { minItems: 3 })).to.deep.equal(equal);
//         expect(validations.minItems(above, { minItems: 3 })).to.equal(above);
//       });
//       it('should reject array length below min', () => {
//         expect(validations.minItems([1,2], { minItems: 3 })).instanceof(ValError);
//       });
//     });
//   });
//
//   describe('', () => {
//     it('should accept ', () => {
//       expect(validations.minItems(, { :  })).to.deep.equal();
//       expect(validations.minItems(, { :  })).to.equal();
//     });
//     it('should reject ', () => {
//       expect(validations.minItems(, { :  })).instanceof(ValError);
//     });
//   });
// });
