const express = require('express');
const router = express.Router();
const db = require('../database/DBConnector');

// Studentenhuis
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

router.post('/studentenhuis', (req,res) => {
    res.send('Het toegevoegde studentenhuis met ' + ID + ' en ' + gebruikersinfo);
});

router.get('/studentenhuis/:huisId?/maaltijd/:maaltijdId?', (req, res) => {

    let huisId = req.params.huisId;
    let maaltijdId = req.params.maaltijdId;
    let result;
    if (maaltijdId === undefined) {
        result = maaltijd.filter((result) => {
            if (result.studentenhuisid === huisId) {
                return result;
            }
        })
    } else {
        result = maaltijd.filter((result) => {
            if (result.studentenhuisid === huisId && result.id === maaltijdId) {
                return result;
            }
        })
    }

    // res.send('WERKT GEWOON');
    // }
    // else if (huisId !== '' && maaltijdId !== '') {
    //     result = maaltijd.filter( (result) => {
    //         if (result.studentenhuisid === huisId && result.id === maaltijdId) {
    //             return result;
    //         }
    //     })
    // }

    if (result === undefined) {
        res.status(404);
        res.send('Niet gevonden (huisId bestaat niet)');
    } else {
        res.status(200);
        res.json(result);
    }

});


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