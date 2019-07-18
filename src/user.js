const azStorage = require("./az-storage.js"),
    Hash = require('./hash.js'),
    Token = require("./token.js"); 

/**
 * Hash for each user is created in the az-storage. When table entity is created. 
 */

module.exports = class User {

    constructor(configuration){
        this.config = Object.assign({}, configuration, {});
    }

    /**
     * 
     * @param {*} user - string
     * @param {*} password - string
     */
    async create(user,password){

        if(!user || !password) throw ("user::create - params are empty");

        const result = await azStorage.addUniqueUserToTableAsync(this.config.azstorage.connectionString,user,password,this.config.azstorage.tables.userAuthentication);

        if(!result || !result[".metadata"] || !result[".metadata"].etag) throw ("user::create - can't create user");

        return await this.get(user);
    }
    /**
     * 
     * @param {*} user - string
     */
    async get(user){

        if(!user) throw ("user::get - params are emtpy");

        const userObj = await azStorage.findUserFromTableAsync(this.config.azstorage.connectionString,user,this.config.azstorage.tables.userAuthentication);

        if(!userObj) throw("user::create - can't find user");

        return {
            user:userObj.PartitionKey,
            created: userObj.Timestamp,
            hash: userObj.hash
        };
    }
    /**
     * 
     * @param {*} user - string
     * @param {*} password - string 
     */
    async login(user,password){

        if(!user || !password) throw ("user::login - params are emtpy");

        // get user Obj which includes hash
        const userObj = await this.get(user);

        if(!userObj) throw ("user::login - user or password is incorrect");

        // validate password to hash
        const hashMgr = new Hash();
        const validatedHash = hashMgr.compare(password, userObj.hash);
        if(!validatedHash) throw ("user::login - user or password is incorrect");

        // get token
        const tokenMgr = new Token(this.config.secret);
        const token = await tokenMgr.createTokenAsync(userObj);
        if(!token) throw ("user::login - token generation error");

        return {
            "user": userObj.user,
            "token": token
        };
    }
    /**
     * 
     * @param {*} user - string such as email address
     * @returns boolean
     */
    async delete(user){

        if(!user) throw ("user::delete - params are emtpy");

        const userObjDeleted = await azStorage.deleteUserFromTableAsync(this.config.azstorage.connectionString,user,this.config.azstorage.tables.userAuthentication);

        if(userObjDeleted.isSuccessful) return true;

        return false;
    }
    async decodeToken(token){
        if(!token) throw ("user::token - params are emtpy");
        const tokenMgr = new Token(this.config.secret);
        const tokenReturned = await tokenMgr.verifyTokenAsync(token);
        if(!tokenReturned) throw ("user::login - token generation error");
        return tokenReturned;
    }
}
