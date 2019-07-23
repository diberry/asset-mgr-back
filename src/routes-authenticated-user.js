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

const uploadFiles = async (req, res, next) => {

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

    let answer = createResponseObject(req.app.config);

    const user = new User(req.app.config);
   
    const returnedUserObj = await user.get(req.user);

    const optionalContentSettings = undefined;
    const optionalMetadata = req.body.tags;

    const downloadURL = await user.addFileToSubdirAsync(req.body.directoryName, req.files.files.name, req.files.files.tempFilePath, optionalContentSettings, optionalMetadata);

    answer.downloadURI =  downloadURL;

    return res.status(200).send(answer);

    
}
module.exports = {
    createResponseObject:createResponseObject,
    uploadFiles: uploadFiles
};