/**
 * Testcases aimed at testing the authentication process. 
 */
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const db = require('../datasource/dbCon')

chai.should()
chai.use(chaiHttp)

// After successful registration we have a valid token. We export this token
// for usage in other testcases that require login.

describe('Registration', function () {
    this.timeout(10000)

    it('should return a token when providing valid information', function (done) {
        chai.request(app)
            .post('/api/register')
            .send({
                "voornaam": "Yannick",
                "achternaam": "Willems",
                "email": "ywillems3@avans.nl",
                "password": "test123"
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')

                db.query("DELETE FROM user WHERE Email = ?", ['ywillems3@avans.nl'])
                done()
            })
    })

    it('should return an error on GET request', function(done) {
        chai.request(app)
            .get('/api/register')
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })

    it('should throw an error when the user already exists', function(done) {
        chai.request(app)
            .post('/api/register')
            .send({
                "voornaam": "Jan",
                "achternaam": "Smit",
                "email": "jsmit@server.nl",
                "password": "secret"
            })
            .end((err, res) => {
                res.should.have.status(409)
                done()
            })
    })

    it('should throw an error when no firstname is provided', function(done) {
        chai.request(app)
            .post('/api/register')
            .send({
                "achternaam": "Willems",
                "email": "ywillems3@avans.nl",
                "password": "test123"
            })
            .end((err, res) => {
                res.should.have.status(412)
                done()
            })
    })

    it('should throw an error when firstname is shorter than 2 chars', function(done) {
        chai.request(app)
            .post('/api/register')
            .send({
                "voornaam": "Y",
                "achternaam": "Willems",
                "email": "ywillems3@avans.nl",
                "password": "test123"
            })
            .end((err, res) => {
                res.should.have.status(412)
                done()
            })
    })

    it('should throw an error when no lastname is provided', function(done) {
        chai.request(app)
            .post('/api/register')
            .send({
                "voornaam": "Yannick",
                "email": "ywillems3@avans.nl",
                "password": "test123"
            })
            .end((err, res) => {
                res.should.have.status(412)
                done()
            })
    })

    it('should throw an error when lastname is shorter than 2 chars', function(done) {
        chai.request(app)
            .post('/api/register')
            .send({
                "voornaam": "Yannick",
                "achternaam": "W",
                "email": "ywillems3@avans.nl",
                "password": "test123"
            })
            .end((err, res) => {
                res.should.have.status(412)
                done()
            })
    })

    it('should throw an error when email is invalid', function(done) {
        chai.request(app)
            .post('/api/register')
            .send({
                "voornaam": "Yannick",
                "achternaam": "Willems",
                "email": "test",
                "password": "test123"
            })
            .end((err, res) => {
                res.should.have.status(409)
                done()
            })
    })
})

describe('Login', function () {
    this.timeout(10000)

    it('should return a token when providing valid information', function(done) {
        chai.request(app)
            .post('/api/login')
            .send({
                "email": "jsmit@server.nl",
                "password": "secret"
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')

                let validToken = res.body.token
                module.exports = {
                    token: validToken
                }
                done()
            })
    })

    it('should throw an error when email does not exist', function(done) {
        chai.request(app)
            .post('/api/login')
            .send({
                "email": "test@avans.nl",
                "password": "test123"
            })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })

    it('should throw an error when email exists but password is invalid', function(done) {
        chai.request(app)
            .post('/api/login')
            .send({
                "email": "jsmit@server.nl",
                "password": "test"
            })
            .end((err, res) => {
                res.should.have.status(401)
                done()
            })
    })

    it('should throw an error when using an invalid email', function(done) {
        chai.request(app)
            .post('/api/login')
            .send({
                "email": "test",
                "password": "secret"
            })
            .end((err, res) => {
                res.should.have.status(409)
                done()
            })
    })
})