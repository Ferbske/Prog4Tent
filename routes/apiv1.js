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
router.get('/studentenhuis/:houseId?', (req, res) => {
    let houseId = req.params.houseId || '';
    if (houseId === '') {
        db.query("SELECT * FROM studentenhuis", (err, result) => {
            if (err) throw err;
            res.json(result)
        });
    } else {
        const houseId = req.params.houseId || '';
        if (houseId) {
            db.query("SELECT * FROM studentenhuis WHERE ID = ?", [houseId], (err, result) => {
                if (result.length > 0) {
                    console.log("exists");
                    res.json(result);
                } else {
                    error.notFound(res);
                }
            });
        }
    }
});

router.get('/studentenhuis/:houseId?/maaltijd/:mealId?', (req, res) => {
    let houseId = req.params.houseId;
    let mealId = req.params.mealId;
    let result;
    if (mealId === undefined) {
        db.query("SELECT * FROM maaltijd WHERE StudentenhuisId = " + houseId, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.json(result);
        });
    } else {
        db.query("SELECT * FROM maaltijd WHERE StudentenhuisId = " + houseId + " AND ID = " + mealId, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.json(result);
        });
    }
    router.get('/studentenhuis/:houseId/maaltijd/:mealId/deelnemers', (req, res) => {
        res.send('GET studentenhuis/houseId/maaltijd/mealId/deelnemers')

    });
});

// POST Requests
// Login with the following body {"username":"<username>", "password":"<password>"}
router.post('/login', (req, res) => {
    let email = req.body.email || '';
    let password = req.body.password || '';

    db.query('SELECT email, password FROM user WHERE email = ?', [email], (error, rows, fields) => {
        if (error) {
            res.status(500).json(error);
        }

        console.log(rows);

        if (email == rows[0].email && password == rows[0].password) {
            let token = auth.encodeToken(email);
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
            db.query("SELECT Email FROM user WHERE Email = ?", [email], function (err, result) {
                if (result.length > 0) {
                    error.emailTaken(res);
                }
                else {
                    db.query("INSERT INTO `user` (Voornaam, Achternaam, Email, Password) VALUES (?, ?, ?, ?)", [firstname, lastname, email, password], function (err, result) {
                        console.log(result);
                        db.query("SELECT Voornaam, Achternaam, Email FROM user WHERE Email = ?", [email], function (err, result) {
                            if (err) throw err;
                            res.json(result)
                        });
                    });
                    let token = auth.encodeToken(email);
                }
            });
        }
        else {
            error.emailInvalid(res);
        }
    }
    else {
        error.missingProp(res);
    }
});

// POST studentenhuis
router.post('/studentenhuis', (req, res) => {
    let name = req.body.naam || '';
    let address = req.body.adres || '';
    let token = req.get('Authorization');
    token = token.substring(7);
    let email = auth.decodeToken(token);
    email = email.sub;

    if (name !== '' && address !== '') {
        db.query("SELECT ID FROM user WHERE email = ?", [email], (err, rows, fields) => {
            let userId = rows[0].ID;
            db.query("INSERT INTO `studentenhuis` (Naam, Adres, UserID) VALUES (?,?,?)", [name, address, userId], (err, rows, field) => {
                if (err) throw err;
                let row = rows.insertId;
                db.query("SELECT * FROM studentenhuis WHERE ID = ?", [row], (err, result) => {
                    if (result.length > 0) {
                        res.json(result);
                    } else {
                        error.notFound(res)
                    }
                });
            });
        });
    } else {
        error.missingProp(res);
    }
});

router.post('/studentenhuis/:houseId', (req, res) => {
    let houseId = req.params.houseId || '';
    let name = req.body.name || '';
    let address = req.body.address || '';
});

router.post('/studentenhuis/:huisId/maaltijd', (req, res) => {
    let name = req.body.naam;
    let description = req.body.beschrijving;
    let ingredients = req.body.ingredienten;
    let allergies = req.body.allergie;
    let price = req.body.prijs;
    let houseID = req.params.huisId;
    let token = req.get('Authorization');
    token = token.substring(7);
    let email = auth.decodeToken(token);
    email = email.sub;

    if (name !== '' && description !== '' && ingredients !== '' && allergies !== '' && price !== '' && houseID !== ''){
        db.query("SELECT ID FROM user WHERE email = ?", [email], (err, rows, fields) => {
            let userId = rows[0].ID;
            db.query("INSERT INTO `maaltijd` (Naam, Beschrijving, Ingredienten, Allergie, Prijs, UserID, StudentenhuisID) VALUES (?,?,?,?,?,?,?)", [name, description, ingredients,allergies, price,userId,houseID], (err, rows, field) => {
                if(err) throw err;
                let row = rows.insertId;
                db.query("SELECT * FROM studentenhuis WHERE ID = ?", [row], (err, result) => {
                    if (result.length > 0) {
                        res.json(result);
                    } else {
                        error.notFound(res)
                    }
                })
            });
        })
    } else {
        error.missingProp(res);
    }
});

// PUT Requests
router.put('/studentenhuis/:houseId', (req, res) => {
    let houseId = req.params.huisId || '';
    let name = req.body.naam || '';
    let address = req.body.adres || '';
    let token = req.get('Authorization');
    token = token.substring(7);
    let email = auth.decodeToken(token);
    email = email.sub;
    if (houseId && name !== '' && address !== '') {
        db.query("SELECT ID FROM user WHERE Email = ?", [email], function (err, rows) {
            let currentUserId = rows[0].ID;

            db.query("SELECT * FROM studentenhuis WHERE ID = ?", [houseId], (err, result) => {
                if (result.length > 0) {
                    console.log("exists");
                } else {
                    error.notFound(res);
                }
            });
            db.query("SELECT UserID FROM studentenhuis WHERE ID = ?", [houseId], function (err, rows) {
                let existingUserId = rows[0].UserID;
                if (currentUserId == existingUserId) {
                    db.query("UPDATE studentenhuis SET naam = ?, adres = ? WHERE ID = ?", [name, address, houseId], (err, result) => {
                        db.query("SELECT * FROM studentenhuis WHERE ID = ?", [houseId], (err, result) => {
                            if (result.length > 0) {
                                res.json(result);
                            } else {
                                error.notFound(res);
                            }
                        });
                    });
                } else {
                    error.InsufficientRights(res);
                }
            });
        });
    } else {
        error.missingProp(res);
    }
});

router.put('/studentenhuis/:houseId/maaltijd/:mealId', (req, res) => {
    res.send('PUT studentenhuis/houseId/maaltijd/mealId')
});

// DELETE Requests
router.delete('/studentenhuis/:houseId', (req, res) => {
    let houseId = req.params.huisId || '';
    let name = req.body.naam || '';
    let address = req.body.adres || '';

    let token = req.get('Authorization');
    token = token.substring(7);
    let email = auth.decodeToken(token);
    email = email.sub;

    if (houseId && name !== '' && address !== '') {
        db.query("SELECT ID FROM user WHERE Email = ?", [email], (err, rows) => {
            let currentUserId = rows[0].ID;

            db.query("SELECT * FROM studentenhuis WHERE ID = ?", [houseId], (err, result) => {
                if (result.length > 0) {
                    console.log("exists");
                } else {
                    error.notFound(res);
                }
            });
            db.query("SELECT UserID FROM studentenhuis WHERE ID = ?", [houseId], (err, rows) => {
                let existingUserId = rows[0].UserID;
                if (currentUserId == existingUserId) {
                    db.query("DELETE FROM studentenhuis WHERE ID = ?", [houseId], (err, result) => {
                        res.status(200).json({
                            "msg": "Huis succesvol verwijderd",
                            "status": "200",
                            "datetime": new Date().format("d-M-Y H:m:s")
                        });
                    });
                } else {
                    error.InsufficientRights(res);
                }
            });
        });
    } else {
        error.missingProp(res);
    }
});

router.delete('/studentenhuis/:houseId/maaltijd/:mealId', (req, res) => {
    res.send('DELETE studentenhuis/houseId/maaltijd/mealId')
});

router.delete('/studentenhuis/:houseId/maaltijd/:mealId/deelnemers', (req, res) => {
    res.send('DELETE studentenhuis/houseId/maaltijd/mealId/deelnemers')
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