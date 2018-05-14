const express = require('express');
const app = express();

app.all('*', (req, res, next) => {
    console.log( req.method + " " + req.url);
    next();
});

app.use('/apiv1', require('./routes/apiv1'));

const port = process.env.PORT || 666;

app.listen(port, () => {
    console.log('The magic happens at http://localhost:' + port);
});

module.exports = app;