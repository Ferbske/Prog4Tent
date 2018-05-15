/**
 * Testcases aimed at testing the authentication process.
 */
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const db = require('../database/DBConnector');

chai.should();
chai.use(chaiHttp);

// After successful registration we have a valid token. We export this token
// for usage in other testcases that require login.
let validToken;

describe('Registration', function () {
    this.timeout(10000);

    it('should return a token when providing valid information', (done) => {
        chai.request(app)
            .post('/api/register')
            .send({
                "firstname": "Kim",
                "lastname": "van Gageldonk",
                "email": "kvgageldonk@hotmail.com",
                "password": "test123"
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');

                db.query("DELETE FROM user WHERE Email = ?", ['kvgageldonk@hotmail.com']);
                done()
            })
    });

    it('should return an error on GET request', (done) => {
        chai.request(app)
            .get('/api/register')
            .end((err, res) => {
                res.should.have.status(404);
                done()
            })
    });

    it('should throw an error when the user already exists', (done) => {
        chai.request(app)
            .post('/api/register')
            .send({
                "firstname": "Jan",
                "lastname": "Smit",
                "email": "jsmit@server.nl",
                "password": "secret"
            })
            .end((err, res) => {
                res.should.have.status(409);
                done()
            })
    });

    it('should throw an error when no firstname is provided', (done) => {
        chai.request(app)
            .post('/api/register')
            .send({
                "lastname": "van Gageldonk",
                "email": "kvgageldonk@hotmail.com",
                "password": "test123"
            })
            .end((err, res) => {
                res.should.have.status(412);
                done()
            })
    });

    it('should throw an error when firstname is shorter than 2 chars', (done) => {
        chai.request(app)
            .post('/api/register')
            .send({
                "firstname": "K",
                "lastname": "van Gageldonk",
                "email": "kvgageldonk@hotmail.com",
                "password": "test123"
            })
            .end((err, res) => {
                res.should.have.status(412);
                done()
            })
    });

    it('should throw an error when no lastname is provided', (done) => {
        chai.request(app)
            .post('/api/register')
            .send({
                "firstname": "Kim",
                "email": "kvgageldonk@hotmail.com",
                "password": "test123"
            })
            .end((err, res) => {
                res.should.have.status(412);
                done()
            })
    });

    it('should throw an error when lastname is shorter than 2 chars', (done) => {
        chai.request(app)
            .post('/api/register')
            .send({
                "firstname": "Kim",
                "lastname": "G",
                "email": "kvgageldonk@hotmail.com",
                "password": "test123"
            })
            .end((err, res) => {
                res.should.have.status(412);
                done()
            })
    });

    it('should throw an error when email is invalid', (done) => {
        chai.request(app)
            .post('/api/register')
            .send({
                "firstname": "Kim",
                "lastname": "van Gageldonk",
                "email": "test",
                "password": "test123"
            })
            .end((err, res) => {
                res.should.have.status(409);
                done()
            })
    })
});

describe('Login', function () {
    this.timeout(10000);

    it('should return a token when providing valid information', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({
                "email": "jsmit@server.nl",
                "password": "secret"
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');

                let validToken = res.body.token;
                module.exports = {
                    token: validToken
                };
                done()
            })
    });

    it('should throw an error when email does not exist', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({
                "email": "test@avans.nl",
                "password": "test123"
            })
            .end((err, res) => {
                res.should.have.status(404);
                done()
            })
    });

    it('should throw an error when email exists but password is invalid', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({
                "email": "jsmit@server.nl",
                "password": "test"
            })
            .end((err, res) => {
                res.should.have.status(401);
                done()
            })
    });

    it('should throw an error when using an invalid email', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({
                "email": "test",
                "password": "test123"
            })
            .end((err, res) => {
                res.should.have.status(409);
                done()
            })
    });
});