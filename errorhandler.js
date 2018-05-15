const format = require('node.date-time');
function missingProp(res) {
    res.status(412).json({
        "msg": "Een of meer properties in de request body ontbreken of zijn foutief",
        "code": 412,
        "datetime": new Date().format("d-M-Y H:m:s")
    })
}

function notFound(res) {
    res.status(404).json({
        "msg": "Niet gevonden",
        "code": 404,
        "datetime": new Date().format("d-M-Y H:m:s")
    })
}


function notAuthorized(res){
    res.status(401).json({
        "msg": "U bent niet geauthoriseerd om deze actie uit te voeren",
        "status": 401,
        "datetime": new Date().format("d-M-Y H:m:s")
    })
}
function emailTaken(res) {
    res.status(409).json({
        "msg": "Conflict (email al in gebruik)",
        "code": 409,
        "datetime": new Date().format("d-M-Y H:m:s")
    })

}
function emailInvalid(res) {
    res.status(409).json({
        "msg": "Conflict (ongeldig emailadres)",
        "code": 409,
        "datetime": new Date().format("d-M-Y H:m:s")
    })

}

module.exports = {
    missingProp,
    notFound,
    notAuthorized,
    emailTaken,
    emailInvalid
};