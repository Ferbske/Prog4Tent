const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const db = require('../database/DBConnector');
const config = require('../config');

let validToken = config.token;
let amount;

chai.should();
chai.use(chaiHttp);

describe('Studentenhuis API POST', function () {
    this.timeout(10000);

    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(app)
            .post('/api/studentenhuis')
            .set('Authorization', 'test')
            .send({
                "naam": "Studjeshuis",
                "adres": "Studjesweg 12"
            })
            .end((err, res) => {
                res.should.have.status(401);
                done()
            })
    });

    it('should return a studentenhuis when posting a valid object', (done) => {
        validToken = config.token;
        chai.request(app)
            .post('/api/studentenhuis')
            .set('Authorization', validToken)
            .send({
                "naam": "Studjeshuis",
                "adres": "Studjesweg 12"
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');

                db.query("DELETE FROM studentenhuis WHERE naam = ?", ['Studjeshuis']);
                done()
            })
    });

    it('should throw an error when naam is missing', (done) => {
        validToken = config.token;
        chai.request(app)
            .post('/api/studentenhuis')
            .set('Authorization', validToken)
            .send({
                "adres": "Studjesweg 12"
            })
            .end((err, res) => {
                res.should.have.status(412);
                done()
            })
    });

    it('should throw an error when adres is missing', (done) => {
        validToken = config.token;
        chai.request(app)
            .post('/api/studentenhuis')
            .set('Authorization', validToken)
            .send({
                "naam": "Studjeshuis"
            })
            .end((err, res) => {
                res.should.have.status(412);
                done()
            })
    })
});

describe('Studentenhuis API GET all', function () {
    this.timeout(10000);

    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(app)
            .get('/api/studentenhuis')
            .set('Authorization', 'test')
            .end((err, res) => {
                res.should.have.status(401);
                done()
            })
    });

    it('should return all studentenhuizen when using a valid token', (done) => {
        validToken = config.token;
        chai.request(app)
            .get('/api/studentenhuis')
            .set('Authorization', validToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                done()
            })
    })
});

describe('Studentenhuis API GET one', function () {
    this.timeout(10000);

    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(app)
            .get('/api/studentenhuis/1')
            .set('Authorization', 'test')
            .end((err, res) => {
                res.should.have.status(401);
                done()
            })
    });

    it('should return the correct studentenhuis when using an existing huisId', (done) => {
        validToken = config.token;
        chai.request(app)
            .get('/api/studentenhuis/1')
            .set('Authorization', validToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.should.be.length(1);
                done()
            })
    });

    it('should return an error when using an non-existing huisId', (done) => {
        validToken = config.token;
        chai.request(app)
            .get('/api/studentenhuis/1337')
            .set('Authorization', validToken)
            .end((err, res) => {
                res.should.have.status(404);
                done()
            })
    })
});

describe('Studentenhuis API PUT', function () {
    this.timeout(10000);

    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(app)
            .put('/api/studentenhuis/1')
            .set('Authorization', 'test')
            .send({
                "naam": "Lovensdijk",
                "adres": "Lovensdijkstraat, Breda"
            })
            .end((err, res) => {
                res.should.have.status(401);
                done()
            })
    });

    it('should return a studentenhuis with ID when posting a valid object', (done) => {
        validToken = config.token;
        chai.request(app)
            .put('/api/studentenhuis/1')
            .set('Authorization', validToken)
            .send({
                "naam": "Lovensdijk",
                "adres": "Lovensdijkstraat, Breda"
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.should.be.length(1);
                done()
            })
    });

    it('should throw an error when naam is missing', (done) => {
        validToken = config.token;
        chai.request(app)
            .put('/api/studentenhuis/1')
            .set('Authorization', validToken)
            .send({
                "adres": "Lovensdijkstraat, Breda"
            })
            .end((err, res) => {
                res.should.have.status(412);
                done()
            })
    });

    it('should throw an error when adres is missing', (done) => {
        validToken = config.token;
        chai.request(app)
        .put('/api/studentenhuis/1')
        .set('Authorization', validToken)
        .send({
            "naam": "Lovensdijk",
        })
        .end((err, res) => {
            res.should.have.status(412);
            done()
        })
    })
});

describe('Studentenhuis API DELETE', function () {
    before(function () {
        chai.request(app)
            .post('/api/studentenhuis')
            .set('Authorization', validToken)
            .send({
                "naam": "TestHuis",
                "adres": "Testweg"
            })
            .end((err, res) => {

            });

        chai.request(app)
            .get('/api/studentenhuis')
            .set('Authorization', validToken)
            .end((err, res) => {
                amount = res.body.length

            })

    });

    this.timeout(10000);

    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(app)
            .delete('/api/studentenhuis/1')
            .set('Authorization', 'test')
            .end((err, res) => {
                res.should.have.status(401);
                done()
            })
    });

    it('should return a studentenhuis when posting a valid object', (done) => {
        chai.request(app)
            .delete('/api/studentenhuis/' + amount)
            .set('Authorization', validToken)
            .end((err, res) => {
                res.should.have.status(200);
                done()
            })
    });
});