const express = require('express');
const router = express.Router();
const db = require('../database/DBConnector');
const deelnemer = require('../database/deelnemer');
const maaltijd = require('../database/maaltijd');
const studentenhuis = require('../database/studentenhuis');
const user = require('../database/user');

// GET requests
router.get('/studentenhuis/:huisId?', (req,res) => {
    let huisId = req.params.huisId || '';
    let result;
    if (huisId === '' ){
        db.query("SELECT * FROM studentenhuis", (err,result) => {
            if(err)throw err;
            console.log(result);
            res.json(result);
        });
    } else {
        db.query("SELECT * FROM studentenhuis WHERE ID = " + huisId, (err,result) => {
            if(err)throw err;
            console.log(result);
            if (result === null){
                res.status(404);
                res.send('Niet gevonden (huisId bestaat niet)');
            } else {
                res.status(200);
                res.json(result);
            }
        });
    }
});

router.get('/studentenhuis/:huisId?/maaltijd/:maaltijdId?', (req, res) => {
    let huisId = req.params.huisId;
    let maaltijdId = req.params.maaltijdId;
    let result;
    if (maaltijdId === undefined) {
        db.query("SELECT * FROM maaltijd WHERE StudentenhuisId = " + huisId, (err,result) => {
            if(err)throw err;
            console.log(result);
            res.json(result);
        });
    } else {
        db.query("SELECT * FROM maaltijd WHERE StudentenhuisId = " + huisId + " AND ID = " + maaltijdId, (err,result) => {
            if(err)throw err;
            console.log(result);
            res.json(result);
        });
    }
router.get('/studentenhuis/:huisId/maaltijd/:maaltijdId/deelnemers', (req,res) => {
    res.send('GET studentenhuis/huidId/maaltijd/maaltijdId/deelnemers')

});
});

// POST Requests
router.post('/login', (req,res) => {
    res.send('POST login')
});

router.post('/register', (req,res) => {
    res.send('POST register')
});

router.post('/studentenhuis', (req,res) => {
    res.send('POST studentenhuis')
});

router.post('/studentenhuis/:huisId', (req,res) => {
    res.send('POST studentenhuis/huisId')
});

router.post('/studentenhuis/:huisId/maaltijd/:maaltijdId', (req,res) => {
    res.send('POST studentenhuis/huisId/maaltijd/maaltijdId')
});

// PUT Requests
router.put('/studentenhuis/:huisId', (req,res) => {
    res.send('PUT studentenhuis/huisId')
});

router.put('/studentenhuis/:huisId/maaltijd/:maaltijdId', (req,res) => {
    res.send('PUT studentenhuis/huisId/maaltijd/maaltijdId')
});

// DELETE Requests
router.delete('/studentenhuis/:huisId', (req,res) => {
    res.send('DELETE studentenhuis/huidId')
});

router.delete('/studentenhuis/:huisId/maaltijd/:maaltijdId', (req,res) => {
    res.send('DELETE studentenhuis/huidId/maaltijd/maaltijdId')
});

router.delete('/studentenhuis/:huisId/maaltijd/:maaltijdId/deelnemers', (req,res) => {
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