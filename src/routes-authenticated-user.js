"use strict";
const User = require('./user.js');
    const uuid = require('uuid/v4');

const createResponseObject = (config) => {
    return {
        dateTime: new Date(),
        id: uuid(),
        ver: config.ver,
        status: null
    };
}
/**
 * Parse stringified object
 * @param {} metadata 
 */
const parseMetadata = (metadata)=> {

    let returnVal = undefined;

    try{
        if(!metadata)return;
        returnVal = JSON.parse(metadata);
    }catch(err){
        console.log(err);
    }finally{
        return returnVal;
    }
}

const uploadFiles = async (req, res, next) => {

    try{
        // files = array of file objects
        // user = req.user
        // directory = req.body.directoryName

        // handled only 1 file right now
        // || (Object.keys(req.files).length == 0)
        if (!req.files  || !req.body || !req.body.directoryName || !req.user) {
            answer.statusCode = 400,
            answer.error = "empty params";
            return res.status(answer.statusCode).send(answer);
        }

        // create return JSON template
        let answer = createResponseObject(req.app.config);

        // get user
        const user = new User(req.app.config);
        const returnedUserObj = await user.get(req.user);

        if(!returnedUserObj) throw("routes-authenticated::uploadFiles - can't get authenticated user");

        // process metadata and content settings
        let optionalContentSettings = undefined;
        let optionalMetadata = undefined;
        if(req.body && req.body.metadata){
            optionalMetadata = parseMetadata(req.body.metadata);
        }

        // add file to Azure Storage Files
        const downloadURL = await user.addFileToSubdirAsync(req.body.directoryName, req.files.files.name, req.files.files.tempFilePath, optionalContentSettings, optionalMetadata);

        // return downloadURI
        answer.downloadURI =  downloadURL;

        return res.status(200).send(answer);

    } catch(err){
        next(err);
    }
    
}
const deleteUser = async (req, res, next)=>{
    try{
        if (!req.user) {
            answer.statusCode = 400,
            answer.error = "empty params";
            return res.status(answer.statusCode).send(answer);
        }

        // create return JSON template
        let answer = createResponseObject(req.app.config);

        const user = new User(req.app.config);

        // make sure user exists
        const userObj = await user.get(req.user);
        if(!userObj) throw("routes-authenticated::deleteUser - can't find user")

        // delete user
        const deleted = await user.delete(req.user);

        if(!deleted) throw("routes-authenticated::deleteUser - can't delete user");

        return res.status(204).send();

    } catch(err){
        next(err);
    }
}
module.exports = {
    createResponseObject:createResponseObject,
    uploadFiles: uploadFiles,
    deleteUser: deleteUser
};