const azStorage = require("./az-storage.js"),
    AzureFiles = require("./az-files.js")
    Hash = require('./hash.js'),
    path =require("path"),
    Token = require("./token.js"); 

/**
 * Hash for each user is created in the az-storage. When table entity is created. 
 */

module.exports = class User {

    constructor(configuration){
        this.config = Object.assign({}, configuration, {});
        this.userEmail = undefined;
        this.UID = undefined; // share name
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

        let createduser = await this.get(user);

        // don't return hash here, make user login
        delete createduser.hash;

        return createduser;
    }
    async setUser(user, uid){
        this.userEmail = user;
        this.UID = uid;
    }
    /**
     * 
     * @param {*} user - string
     */
    async get(user){

        if(!this.config || !this.config.azstorage || !this.config.azstorage.connectionString || !this.config.azstorage.tables || !this.config.azstorage.tables.userAuthentication) throw ("user::get - prereqs are empty");

        console.log("get(user) = " + user);

        if(!user) throw ("user::get - params are emtpy");

        const userObj = await azStorage.findUserFromTableAsync(this.config.azstorage.connectionString,user,this.config.azstorage.tables.userAuthentication);

        if(!userObj || !userObj.PartitionKey || !userObj.UID) throw("user::create - can't find user");

        // set class property
        this.userEmail = userObj.PartitionKey;
        this.UID = userObj.UID;

        return {
            user:userObj.PartitionKey,
            UID: userObj.UID,
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

        try{
            if(!user) throw ("user::delete - params are emtpy");

            const userObj = await this.get(user);

            if(!userObj || !userObj.UID) throw('user::delete - can\'t get User object');

            const userDeleteShare = await this.deleteShareAsync();

            // TBD: what is the best thing to do if this fails?
            if(!userDeleteShare) console.log("didn't delete user share when deleting user");

            const userObjDeleted = await azStorage.deleteUserFromTableAsync(this.config.azstorage.connectionString,user,this.config.azstorage.tables.userAuthentication);
            if(userObjDeleted.isSuccessful) return true;

            return false;
        }catch(err){
            console.log(err);
            throw err;
        }
    }
    async decodeToken(token){
        if(!token) throw ("user::token - params are emtpy");
        const tokenMgr = new Token(this.config.secret);
        const tokenReturned = await tokenMgr.verifyTokenAsync(token);
        if(!tokenReturned) throw ("user::login - token generation error");
        return tokenReturned;
    }
    async addFileToSubdirAsync(subdir, displayFileName, fullPathToFile, optionalContentSettings, optionalMetadata){

        if(!this.userEmail) throw("user::addFileToSubdirAsync - prereqs are empty");

        if(!subdir || !displayFileName || !fullPathToFile) throw("user::addFileToSubdirAsync - params are empty");

        // TBD: check if file exists

        const azureFiles = new AzureFiles(this.config, this.UID);
        const fileResult = await azureFiles.addFileAsync(subdir, displayFileName, fullPathToFile, optionalContentSettings, optionalMetadata);

        const fileURL = await azureFiles.getFileUrlAsync(subdir, displayFileName); 

        return fileURL;        
    }
    // assumes no nested dirs
    async listDirectoriesAsync(){
        if(!this.userEmail) throw("user::listDirectories - prereqs are empty");

        const baseDirectory = "";

        const azureFiles = new AzureFiles(this.config, this.userEmail);
        const filesAndDirsForBase = await azureFiles.getDirectoriesAndFiles(baseDirectory);

        return filesAndDirsForBase.directories;
    }
    async listFilesInDirectoryAsync(directory){

        if(!this.userEmail) throw("user::listFilesInDirectory - prereqs are empty");

        if(!directory) throw("user::listFilesInDirectory - params are empty");

        const azureFiles = new AzureFiles(this.config, this.userEmail);
        const filesAndDirsForSubdir = await azureFiles.getDirectoriesAndFiles(directory.toLowerCase());

        return filesAndDirsForSubdir.files;
    }
    async deleteFileAsync(directory,  displayFileName){
        if(!this.userEmail) throw("user::deleteFile - prereqs are empty");

        if(!directory || displayFileName) throw("user::deleteFile - params are empty");  
        
        const azureFiles = new AzureFiles(this.config, this.userEmail);
        const filesAndDirsForSubdir = await azureFiles.getDirectoriesAndFiles(directory.toLowerCase());

        // return list of files deleted with status
        return filesAndDirsForSubdir.files;        
    }  
    async deleteShareAsync(options=undefined){

        if(!this.UID) throw("user::deleteShareAsync - prereqs are empty");     

        const azureFiles = new AzureFiles(this.config, this.UID);
        const deleteShareResultsJson = await azureFiles.deleteShareAsync(this.UID);

        // only when deleting the user
        return deleteShareResultsJson; 
    }  
    async deleteDirectoryAsync(directory, options=undefined){

        if(!this.userEmail) throw("user::deleteDirectory - prereqs are empty");

        if(!directory) throw("user::deleteDirectory - params are empty");      

        const azureFiles = new AzureFiles(this.config, this.userEmail);
        const deleteDirectoryResultsJson = await azureFiles.deleteDirectoryAsync(directory.toLowerCase());

        // return status & list of files deleted with status
        return deleteDirectoryResultsJson; 
    } 
    async createDirectoryAsync(directory, options=undefined){
        if(!this.userEmail) throw("user::createDirectory - prereqs are empty");

        if(!directory) throw("user::createDirectory - params are empty");      

        const azureFiles = new AzureFiles(this.config, this.userEmail);
        const createDirectoryResultsJson = await azureFiles.createDirectoryAsync(directory.toLowerCase());

        return createDirectoryResultsJson; 
    }  
}
