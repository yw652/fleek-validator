var app = require('./basic.js');
var assert = require('assert');
var request = require('supertest').agent(app.listen());

describe('Validating', function () {
    it('GET /users/123 should return 200', function (done) {
        request
            .get('/users/123')
            .expect("X-fleek-validation", "OK")
            .expect(200)
            .end(done);
    });
    it('GET /users/abc should return 400', function (done) {
        request
            .get('/users/abc')
            .expect("X-fleek-validation", "KO")
            .expect(400)
            .end(function(err, res) {
                assert.equal(res.body.error_name, 'VALIDATION_FAILED');
                assert.equal(res.body.details[0].name, 'TYPE.INTEGER');
                assert.equal(res.body.details[0].code, 102);
                assert.equal(res.body.details[0].message, 'Integer expected');
                done();
            });
    });
    it('POST /users should return 201', function (done) {
        request
            .post('/users')
            .send({ name: 'test'})
            .expect("X-fleek-validation", "OK")
            .expect(201)
            .end(done);
    });
    it('POST /users with empty body should return 400', function (done) {
        request
            .post('/users')
            .send({})
            .expect("X-fleek-validation", "KO")
            .expect(400)
            .end(done);
    });
})
