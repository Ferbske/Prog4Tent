let mysql = require('mysql');

let con = mysql.createConnection({
    host: "188.166.109.108",
    user: "studentenhuis_user",
    password: "secret",
    database: "studentenhuis"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = con;