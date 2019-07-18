const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = class Token {
    constructor(secret){
        this.secret = secret;
    }
    async verifyTokenAsync(token){

        const self = this;

        return new Promise(function(resolve, reject) {

            if(!self.secret) return reject("token::verifyTokenAsync - constructor param is empty");

            if(!token) return reject("token::verifyTokenAsync - token param is empty");


            jwt.verify(token, self.secret, (err,decoded) => {
                if(err){
                    return resolve({
                        user: null,
                        validToken: false
                    });
                }
                
                return resolve({
                    user: decoded,
                    validToken: true
                });
            });

        });
    }
    /**
     * 
     * @param {*} user - Object of User information 
     * @param {*} secret - String
     */
    createTokenAsync(user){
        const self = this;

        return new Promise(function(resolve, reject) {


            if(!self.secret) return reject("token::createTokenAsync - constructor param is empty");

            if(!user) return reject("token::createTokenAsync - User param is empty");

            let token = jwt.sign(user,self.secret,
                { //expiresIn: '24h' // expires in 24 hours
                //expiresIn: 60 // expires in 1 minute
                expiresIn: (60 * 10) // expires in 5 minutes
                }
            );

            return resolve(token);
        });
    }

}