const text = require("../src/text.js");

text.translate().then(x =>{
    console.log(x);
}).catch(err => {
    console.log(err);
});
