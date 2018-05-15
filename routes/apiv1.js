const express = require('express');
const router = express.Router();
const jwt = require('jwt-simple');
const auth = require('../auth/authentication');
const db = require('../database/DBConnector');
const regex = require('regex-email');
const error = require('../errorhandler');

// TEST DATA

const deelnemer = require('../database/deelnemer');
const maaltijd = require('../database/maaltijd');
const studentenhuis = require('../database/studentenhuis');
const user = require('../database/user');

// GET requests
router.get('/studentenhuis/:huisId?', (req, res) => {
    let huisId = req.params.huisId || '';
    if (huisId === '') {
        db.query("SELECT * FROM studentenhuis", (err, result) => {
            if (err) throw err;
            res.json(result);
        });
    } else {
        db.query("SELECT * FROM studentenhuis WHERE ID = ?", [huisId], (err, result) => {
            if (result.length > 0) {
                res.json(result);
            } else {
                error.notFound(res);
            }
        });
    }
});

router.get('/studentenhuis/:huisId?/maaltijd/:maaltijdId?', (req, res) => {
    let huisId = req.params.huisId;
    let maaltijdId = req.params.maaltijdId;
    let result;
    if (maaltijdId === undefined) {
        db.query("SELECT * FROM maaltijd WHERE StudentenhuisId = " + huisId, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.json(result);
        });
    } else {
        db.query("SELECT * FROM maaltijd WHERE StudentenhuisId = " + huisId + " AND ID = " + maaltijdId, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.json(result);
        });
    }
    router.get('/studentenhuis/:huisId/maaltijd/:maaltijdId/deelnemers', (req, res) => {
        res.send('GET studentenhuis/huidId/maaltijd/maaltijdId/deelnemers')

    });
});

// POST Requests
// Login with the following body {"username":"<username>", "password":"<password>"}
router.post('/login', (req, res) => {
    let username = req.body.username || '';
    let password = req.body.password || '';

    db.query('SELECT email, password FROM user WHERE email = ?', [username], (error, rows, fields) => {
        if(error) {
            res.status(500).json(error);
        }

        console.log(rows);

        if (username == rows[0].email && password == rows[0].password) {
            let token = auth.encodeToken(username);
            res.status(200).json({
                "token": token,
                "status": 200,
                "parameters": res.body
            });
        } else {
            error.notAuthorized(res);
        }
    });
});

// Register with the follow body {"firstname": "<firstname>","lastname": "<lastname>","email": "<email>","password": "<password>"}
router.post('/register', (req, res) => {
    let firstname = req.body.firstname || '';
    let lastname = req.body.lastname || '';
    let email = req.body.email || '';
    let password = req.body.password || '';
    if (firstname !== '' && lastname !== '' && email !== '' && password !== '') {
        if (regex.test(email) === true) {
            db.query("SELECT Email FROM user WHERE Email = ?", [email], function(err, result) {
                if(result.length > 0){
                    error.emailTaken(res);
                }
                else{
                    db.query("INSERT INTO `user` (Voornaam, Achternaam, Email, Password) VALUES (?, ?, ?, ?)" ,[firstname, lastname, email, password], function(err, result) {
                        console.log(result);
                        db.query("SELECT Voornaam, Achternaam, Email FROM user WHERE Email = ?",[email], function(err, result) {
                            if (err) throw err;
                            res.json(result)});
                    });
                    let token = auth.encodeToken(email);
                }
            });
        }
        else{
            error.emailInvalid(res);
        }
    }
    else{
        error.missingProp(res);
    }
});

//
router.post('/studentenhuis', (req, res) => {
    let name = req.body.name || '';
    let address = req.body.address || '';
    let token = req.get('Authorization');
    token = token.substring(7);
    let email = auth.decodeToken(token);
    email = email.sub;

    if (name !== '' && address !== ''){
        db.query("SELECT ID GROM user WHERE email = ?", [email], (err, rows, fields) => {
            let userId = rows[0].ID;
            db.query("INSERT INTO `studentenhuis` (Naam, Adres, UserID) VALUES (?,?,?)", [naam, address, userId], (err, rows, field) => {
                if(err) throw err;
                let row = rows.insertId;
                selectId(row, res);
            });
        })
    } else {
        error.missingProp(res);
    }
});

router.post('/studentenhuis/:huisId', (req, res) => {
    res.send('POST studentenhuis/huisId')
});

router.post('/studentenhuis/:huisId/maaltijd/:maaltijdId', (req, res) => {
    res.send('POST studentenhuis/huisId/maaltijd/maaltijdId')
});

// PUT Requests
router.put('/studentenhuis/:huisId', (req, res) => {
    res.send('PUT studentenhuis/huisId')
});

router.put('/studentenhuis/:huisId/maaltijd/:maaltijdId', (req, res) => {
    res.send('PUT studentenhuis/huisId/maaltijd/maaltijdId')
});

// DELETE Requests
router.delete('/studentenhuis/:huisId', (req, res) => {
    res.send('DELETE studentenhuis/huidId')
});

router.delete('/studentenhuis/:huisId/maaltijd/:maaltijdId', (req, res) => {
    res.send('DELETE studentenhuis/huidId/maaltijd/maaltijdId')
});

router.delete('/studentenhuis/:huisId/maaltijd/:maaltijdId/deelnemers', (req, res) => {
    res.send('DELETE studentenhuis/huidId/maaltijd/maaltijdId/deelnemers')
});

// ALL Requests

router.all('/version', (req, res) => {
    res.status(500);
    res.json({
        "description": "Thank you for using API version 1"
    })
});

router.all('*', (req, res) => {
    res.status(404);
    res.send('404 - Not found');
});

module.exports = router;