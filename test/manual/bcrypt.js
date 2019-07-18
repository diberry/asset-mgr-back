var bcrypt = require('bcryptjs');
var salt1 = bcrypt.genSaltSync(10);
var hash1 = bcrypt.hashSync("password", salt1);

var salt2 = bcrypt.genSaltSync(10);
var hash2 = bcrypt.hashSync("password", salt2);


var result1 = bcrypt.compareSync("password", hash1); // true
var result2 = bcrypt.compareSync("password", hash2); // true


console.log(result);