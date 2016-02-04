var app = require('./basic.js');
var request = require('supertest').agent(app.listen());

describe('Validating', function () {
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
    })
})