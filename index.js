const express = require('express');
const expressJWT = require('express-jwt');
const config = require('./config');
const api = require('./routes/apiv1');
const bodyParser = require('body-parser');
const format = require('node.date-time');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(expressJWT({
    secret: config.secretkey
}).unless({
    path: ['/api/login', '/api/register']
}));

app.use((err, req, res, next) => {
    if(err.name === 'UnauthorizedError') {
        res.status(401).json({
            "msg": "Niet geautoriseerd (geen valid token)",
            "code": 401,
            "datetime": new Date().format("d-M-Y H:m:s")
        });
        return;
    }
    next();
});

app.use('/api', api);

app.listen(config.port);

module.exports = app;