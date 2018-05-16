const config = require('../config.js');
const moment = require('moment');
const jwt = require('jwt-simple');

// Het Encoden van een Username naar een Token

function encodeToken(username){
    const payload = {
        exp: moment().add(10, 'days').unix(),
        iat: moment().unix(),
        sub: username
    };
    return jwt.encode(payload, config.secretkey);
}

// Het Decoden van een Token naar een Username

function decodeToken(token, cb) {
    try {
        const payload = jwt.decode(token, config.secretkey);
        const now = moment().unix();

        if (now > payload.exp){
            console.log('Token has expired.');
        }
        return payload;
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    encodeToken,
    decodeToken
};