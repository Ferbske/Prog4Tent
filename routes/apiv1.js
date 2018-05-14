const express = require('express');
const router = express.Router();
const recipes = require('../data/recipes');

router.get('/', (req, res) => {
    res.send('Hello Avans!');
});

router.get('/about', (req, res) => {
    res.send('Written by <Rick Voesenek>');
});

router.get('/info', (req,res) => {
   res.status(200);
   res.json({
       "server": "restful",
       "author": "rick voesenek"
   })
});

router.get('/recipes/:number?', (req,res) => {
    let number = req.params.number || '';
    let result;
    if( number === '' ){
        result = recipes;
    } else {
        number = number - 1;
        result = recipes[number];
    }
    res.status(200);
    res.json(result);
});

router.post('/', (req, res) => {
    res.send('Hello Avans, POST request received!');
});

router.put('/', (req, res) => {
    res.send('Hello Avans, PUT request received!');
});

router.all('/version', (req,res) => {
    res.status(500);
    res.json({
        "description": "Thank you for using API version 2"
    })
});

router.all('*', (req,res) => {
    res.status(404);
    res.send('404 - Not found');
});

module.exports = router;