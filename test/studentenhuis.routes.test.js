const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const db = require('../datasource/dbCon')

let validToken
let amount

chai.should()
chai.use(chaiHttp)

describe('Studentenhuis API POST', function () {
    before(function () {
        validToken = require('./authentication.routes.test').token
    })

    this.timeout(10000)

    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(app)
            .post('/api/studentenhuis')
            .set('Authorization', 'test')
            .send({
                "name": "Huize Pils Genoeg",
                "address": "Wegenweg 16"
            })
            .end((err, res) => {
                res.should.have.status(401)
                done()
            })
    })

    it('should return a studentenhuis when posting a valid object', (done) => {
        chai.request(app)
            .post('/api/studentenhuis')
            .set('Authorization', validToken)
            .send({
                "name": "Huize Pils Genoeg",
                "address": "Wegenweg 16"
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('array')

                db.query("DELETE FROM studentenhuis WHERE naam = ?", ['Huize Pils Genoeg'])
                done()
            })
    })

    it('should throw an error when naam is missing', (done) => {
        chai.request(app)
            .post('/api/studentenhuis')
            .set('Authorization', validToken)
            .send({
                "address": "Wegenweg 16"
            })
            .end((err, res) => {
                res.should.have.status(412)
                done()
            })
    })

    it('should throw an error when adres is missing', (done) => {
        chai.request(app)
            .post('/api/studentenhuis')
            .set('Authorization', validToken)
            .send({
                "name": "Huize Pils Genoeg"
            })
            .end((err, res) => {
                res.should.have.status(412)
                done()
            })
    })
})

describe('Studentenhuis API GET all', function () {
    before(function () {
        validToken = require('./authentication.routes.test').token
    })

    this.timeout(10000)

    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(app)
            .get('/api/studentenhuis')
            .set('Authorization', 'test')
            .end((err, res) => {
                res.should.have.status(401)
                done()
            })
    })

    it('should return all studentenhuizen when using a valid token', (done) => {
        chai.request(app)
            .get('/api/studentenhuis')
            .set('Authorization', validToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('array')
                done()
            })
    })
})

describe('Studentenhuis API GET one', function() {
    before(function () {
        validToken = require('./authentication.routes.test').token
    })

    this.timeout(10000)

    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(app)
            .get('/api/studentenhuis/1')
            .set('Authorization', 'test')
            .end((err, res) => {
                res.should.have.status(401)
                done()
            })
    })

    it('should return the correct studentenhuis when using an existing huisId', (done) => {
        chai.request(app)
            .get('/api/studentenhuis/1')
            .set('Authorization', validToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body.should.be.length(1)
                done()
            })
    })

    it('should return an error when using an non-existing huisId', (done) => {
        chai.request(app)
            .get('/api/studentenhuis/999')
            .set('Authorization', validToken)
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
})

describe('Studentenhuis API PUT', function() {
    before(function () {
        validToken = require('./authentication.routes.test').token
    })

    this.timeout(10000)

    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(app)
            .put('/api/studentenhuis/1')
            .set('Authorization', 'test')
            .send({
                "name": "Lovensdijk",
                "address": "Lovensdijkstraat, Breda"
            })
            .end((err, res) => {
                res.should.have.status(401)
                done()
            })
    })

    it('should return a studentenhuis with ID when posting a valid object', (done) => {
        chai.request(app)
            .put('/api/studentenhuis/1')
            .set('Authorization', validToken)
            .send({
                "name": "Lovensdijk",
                "address": "Lovensdijkstraat, Breda"
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body.should.be.length(1)
                done()
            })
    })

    it('should throw an error when naam is missing', (done) => {
        chai.request(app)
            .put('/api/studentenhuis/1')
            .set('Authorization', validToken)
            .send({
                "address": "Lovensdijkstraat, Breda"
            })
            .end((err, res) => {
                res.should.have.status(412)
                done()
            })
    })

    it('should throw an error when adres is missing', (done) => {
        chai.request(app)
        .put('/api/studentenhuis/1')
        .set('Authorization', validToken)
        .send({
            "name": "Lovensdijk",
        })
        .end((err, res) => {
            res.should.have.status(412)
            done()
        })
    })
})

describe('Studentenhuis API DELETE', function() {
    before(function () {
        validToken = require('./authentication.routes.test').token

        chai.request(app)
            .post('/api/studentenhuis')
            .set('Authorization', validToken)
            .send({
                "name": "TestHuis",
                "address": "Testweg"
            })
            .end((err, res) => {
                
            })
        
        chai.request(app)
            .get('/api/studentenhuis')
            .set('Authorization', validToken)
            .end((err, res) => {
                amount = res.body.length
            })
            
    })

    this.timeout(10000)

    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(app)
            .delete('/api/studentenhuis/1')
            .set('Authorization', 'test')
            .end((err, res) => {
                res.should.have.status(401)
                done()
            })
    })

    it('should return a studentenhuis when posting a valid object', (done) => {
        chai.request(app)
            .delete('/api/studentenhuis/' + amount)
            .set('Authorization', validToken)
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })

    it('should throw an error when naam is missing', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })

    it('should throw an error when adres is missing', (done) => {
        //
        // Hier schrijf je jouw testcase.
        //
        done()
    })
})