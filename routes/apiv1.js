const express = require('express');
const router = express.Router();
const deelnemers = require('../data/deelnemer');
const maaltijd = require('../data/maaltijd');
const studentenhuis = require('../data/studentenhuis');
const user = require('../data/user');

router.get('/', (req, res) => {
    res.send('Hello Avans!');
});

router.get('/studentenhuis/:naam?', (req, res) => {
    let naam = req.params.naam || '';
    let result;
    if (naam === '') {
        result = studentenhuis;
    } else {
        result = studentenhuis.filter((user) => {
            if (user.naam === naam) {
                return user;
            }
        })
    }
    res.status(200);
    res.json(result);
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