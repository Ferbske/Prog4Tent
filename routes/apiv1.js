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

                    res.json(result);
                } else {
                    error.notFound(res);
                }
            });
        }
    }
});

router.get('/studentenhuis/:houseId/maaltijd/:mealId?', (req, res) => {
    let houseId = req.params.houseId;
    let mealId = req.params.mealId;
    if (mealId === undefined) {
        db.query("SELECT ID, Naam, Beschrijving, Ingredienten, Allergie, Prijs FROM maaltijd WHERE StudentenhuisID = ?", [houseId], (err, result) => {
            if (result.length > 0) {
                res.json(result)
            } else {
                error.noResult(res)
            }
        })
    } else {
        db.query("SELECT * FROM maaltijd WHERE StudentenhuisId = " + houseId + " AND ID = " + mealId, (err, result) => {
            if (result.length > 0) {
                res.json(result)
            } else {
                error.notFound(res);
            }
        });
    }
    router.get('/studentenhuis/:houseId/maaltijd/:mealId/deelnemers', (req, res) => {
        res.send('GET studentenhuis/houseId/maaltijd/mealId/deelnemers')

    });
});

router.get('/studentenhuis/:houseId/maaltijd/:mealId/deelnemers', (req, res) => {
    let houseId = req.params.houseId;
    let mealId = req.params.mealId;

    db.query("SELECT * FROM maaltijd WHERE ID = ?", [mealId], (err, result) => {
        if (result.length > 0) {
            db.query("SELECT * FROM studentenhuis WHERE ID = ?", [houseId], (err, result) => {
                if (result.length > 0) {
                    db.query("SELECT * FROM deelnemers WHERE StudentenhuisID = ? AND MaaltijdID = ?", [houseId, mealId], (err, result) => {
                        if (err) throw err;
                        res.json(result);
                    });
                } else {
                    error.notFound(res);
                }
            });
        } else {
            error.notFound(res);
        }
    });
});

// POST Requests
// Login with the following body {"username":"<username>", "password":"<password>"}
router.post('/login', (req, res) => {
    let email = req.body.email || '';
    let password = req.body.password || '';

    if (regex.test(email) === true) {
        db.query('SELECT email, password FROM user WHERE email = ?', [email], (err, rows, fields) => {
            if (err) {
                res.status(500).json(error);
                return;
            }

            if (rows.length < 1) {
                error.notFound(res);
                return;
            }

            if (email === rows[0].email && password === rows[0].password) {
                let token = auth.encodeToken(email);
                res.status(200).json({
                    "token": token,
                    "status": 200,
                    "parameters": res.body
                });
            } else {
                error.notAuthorized(res);
            }
        })
    } else {
        error.emailInvalid(res);
    }
});

// Register with the following body {"firstname": "<firstname>","lastname": "<lastname>","email": "<email>","password": "<password>"}
router.post('/register', (req, res) => {
    let firstname = req.body.firstname || '';
    let lastname = req.body.lastname || '';
    let email = req.body.email || '';
    let password = req.body.password || '';

    if (firstname !== '' && lastname !== '' && email !== '' && password !== '') {
        if (firstname.length < 2 || lastname.length < 2) {
            error.missingProp(res);
            return;
        }
        if (regex.test(email) === true) {
            db.query("SELECT Email FROM user WHERE Email = ?", [email], (err, result) => {
                if (result.length > 0) {
                    error.emailTaken(res);
                } else {
                    db.query("INSERT INTO `user` (Voornaam, Achternaam, Email, Password) VALUES (?, ?, ?, ?)", [firstname, lastname, email, password], (err, result) => {
                        db.query("SELECT Voornaam, Achternaam, Email FROM user WHERE Email = ?", [email], (err, result) => {
                            if (err) throw err;
                        })
                    });
                    let token = auth.encodeToken(email);
                    res.json({
                        token: token
                    });
                }
            })
        }
        else {
            error.emailInvalid(res);
        }
    }
    else {
        error.missingProp(res);
    }
});

// Studentenhuis with the following body {"naam": "<naam>", "adres": "<adres>"}
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
                db.query("SELECT * FROM studentenhuis WHERE ID = ?", [userId], (err, result) => {
                    if (result.length > 0) {
                        console.log(res);
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

// Maaltijd with the following body {"naam": "<naam>", "beschrijving": "<beschrijving>", "ingredienten": "<ingredienten>", "allergie": "<allergie>", "prijs": "<prijs>"}
router.post('/studentenhuis/:houseId/maaltijd', (req, res) => {
    let name = req.body.naam;
    let description = req.body.beschrijving;
    let ingredients = req.body.ingredienten;
    let allergies = req.body.allergie;
    let price = req.body.prijs;
    let houseID = req.params.houseId;
    let token = req.get('Authorization');
    token = token.substring(7);
    let email = auth.decodeToken(token);
    email = email.sub;

    if (name !== '' && description !== '' && ingredients !== '' && allergies !== '' && price !== '' && houseID !== '') {
        db.query("SELECT ID FROM user WHERE email = ?", [email], (err, rows, fields) => {
            let userId = rows[0].ID;
            db.query("INSERT INTO `maaltijd` (Naam, Beschrijving, Ingredienten, Allergie, Prijs, UserID, StudentenhuisID) VALUES (?,?,?,?,?,?,?)", [name, description, ingredients, allergies, price, userId, houseID], (err, rows, field) => {
                if (err) throw err;
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

// Deelnemers with the follow body {"voornaam": "<voornaam>", "achternaam": "<achernaam>", "email": "<email>"}
router.post('/studentenhuis/:houseId/maaltijd/:mealId/deelnemers', (req, res) => {
    let mealId = req.params.mealId;
    let houseId = req.params.houseId;
    let token = req.get('Authorization');
    token = token.substring(7);
    let email = auth.decodeToken(token);
    email = email.sub;

    db.query("SELECT ID FROM user WHERE email = ?;", [email], (err, rows, fields) => {
        let userId = rows[0].ID;
        db.query("SELECT * FROM deelnemers WHERE UserID = ? AND StudentenhuisID = ? AND MaaltijdID = ?;", [userId, houseId, mealId], (err, result) => {
            if (result.length > 0) {
                error.AlreadySigned(res);
            } else {
                db.query("INSERT INTO `deelnemers` (UserID, StudentenhuisID, MaaltijdID) VALUES ('" + userId + "', '" + houseId + "', '" + mealId + "');", (err, result) => {
                    if (result.length > 0) {
                        db.query("SELECT Voornaam, Achternaam, Email FROM user WHERE ID = ?;", [userId], (err, result) => {
                            if (err) throw err;
                            res.json(result)
                        });
                    }
                });
            }
        });
    });
});

// PUT Requests
router.put('/studentenhuis/:houseId', (req, res) => {
    let houseId = req.params.houseId || '';
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

                } else {
                    error.notFound(res);
                }
            });
            db.query("SELECT UserID FROM studentenhuis WHERE ID = ?", [houseId], function (err, rows) {
                let existingUserId = rows[0].UserID;
                if (currentUserId === existingUserId) {
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
    let mealId = req.params.mealId || '';
    let houseId = req.params.houseId || '';
    let Name = req.body.naam || '';
    let Desc = req.body.Beschrijving || '';
    let Ingredients = req.body.Ingredienten || '';
    let Allergies = req.body.Allergie || '';
    let Price = req.body.Prijs || '';

    let token = req.get('Authorization');
    token = token.substring(7);
    let email = auth.decodeToken(token);
    email = email.sub;

    if (Name !== '' && Desc !== '' && Ingredients !== '' && Allergies !== '' && Price !== '') {
        db.query("SELECT ID FROM user WHERE Email = ?", [email], function (err, rows) {
            let currentUserId = rows[0].ID;

            db.query("SELECT * FROM studentenhuis WHERE ID = ?", [houseId], (err, result) => {
                if (result.length > 0) {

                } else {
                    error.notFound(res)
                }
            });
            db.query("SELECT UserID FROM maaltijd WHERE ID = ?", [mealId], function (err, rows) {
                let existingUserId = rows[0].UserID;

                if (currentUserId === existingUserId) {
                    db.query("UPDATE maaltijd SET Naam = ?, Beschrijving = ?, Ingredienten = ?, Allergie = ?, Prijs = ? WHERE ID = ?", [Name, Desc, Ingredients, Allergies, Price, mealId], function (err, result) {
                        db.query("SELECT ID, Naam, Beschrijving, Ingredienten, Allergie, Prijs FROM maaltijd WHERE ID = ? ", [mealId], (err, result) => {
                            res.json(result);
                        })
                    })
                } else {
                    error.InsufficientRights(res);
                }
            })
        })
    } else {
        error.missingProp(res);
    }
});

// DELETE Requests
router.delete('/studentenhuis/:houseId', (req, res) => {
    let houseId = req.params.houseId || '';
    let token = req.get('Authorization');
    token = token.substring(7);
    let email = auth.decodeToken(token);
    email = email.sub;

    if (houseId !== '') {
        db.query("SELECT ID FROM user WHERE Email = ?", [email], (err, rows) => {
            let currentUserId = rows[0].ID;

            db.query("SELECT * FROM studentenhuis WHERE ID = ?", [houseId], (err, result) => {
                if (result.length > 0) {

                } else {
                    error.notFound(res);
                }
            });
            db.query("SELECT UserID FROM studentenhuis WHERE ID = ?", [houseId], (err, rows) => {
                let existingUserId = rows[0].UserID;
                if (currentUserId === existingUserId) {
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
    let mealId = req.params.mealId || '';
    let houseId = req.params.houseId || '';

    db.query("SELECT * FROM maaltijd WHERE ID = ?", [mealId], (err, result) => {
        if (result.length > 0) {
            let token = req.get('Authorization');
            token = token.substring(7);
            let email = auth.decodeToken(token);
            email = email.sub;
            db.query("SELECT ID FROM user WHERE Email = ?", [email], function (err, rows) {
                let currentUserId = rows[0].ID;

                db.query("SELECT * FROM studentenhuis WHERE ID = ?", [houseId], (err, result) => {
                    if (result.length > 0) {

                    } else {
                        error.notFound(res)
                    }
                });
                db.query("SELECT UserID FROM maaltijd WHERE ID = ?", [mealId], function (err, rows) {
                    let existingUserId = rows[0].UserID;

                    if (currentUserId === existingUserId) {
                        db.query("DELETE FROM maaltijd WHERE ID = ?", [mealId], function (err, result) {
                            res.status(200).json({
                                "msg": "maaltijd succesvol verwijderd",
                                "status": "200",
                                "datetime": new Date().format("d-M-Y H:m:s")
                            })
                        })
                    } else {
                        error.InsufficientRights(res)
                    }
                })
            })

        } else {
            error.notFound(res)
        }
    })
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