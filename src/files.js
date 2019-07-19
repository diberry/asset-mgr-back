const fse = require('fs-extra');
const fs = require("fs");
const path = require('path');

const storage = require('./az-storage.js');

const createWriteStream = async (fileNameWithFullPath) => {

    try{
        if (!fileNameWithFullPath) throw ("Empty parameters");

        const dir = path.dirname(fileNameWithFullPath);
    
        if (!dir) throw ("Empty directory");
    
        // create dir if it doesn't exist
        //await fse.ensureDir(dir);
    
        return fs.createWriteStream(fileNameWithFullPath);
    } catch (err){
        throw err;
    }


}
const createReadStream = async (fileNameWithFullPath) => {

    try{
        if (!fileNameWithFullPath) throw ("Empty parameters");

        const dir = path.dirname(fileNameWithFullPath);
    
        if (!dir) throw ("Empty directory");
    
        // create dir if it doesn't exist
        await fse.ensureDir(dir);
    
        return await fse.createReadStream(fileNameWithFullPath);
    } catch (err){
        throw err;
    }


}
const readFile = async (fileNameWithFullPath, format="utf-8")=>{

    try{
        if (!fileNameWithFullPath) throw ("Empty fileNameWithFullPath parameter");

        return await fse.readFile(fileNameWithFullPath,format);
    }catch(err){
        throw err;
    }
}
/** 
    const optionalContentSettings = {
        contentType: undefined,
        contentEncoding: undefined,
        contentLanguage: undefined
    };

    const optionalMetadataSettings = {
        context: "Jest-test"
    };
    storageConnectionString, share, directory, filename, fileWithPath, optionalContentSettings={}, optionalMetadata={}
 */
const uploadFileInfoToQueueAsync = async (config, userNameOrId, fileName, fileNameWithFullPath, options)=>{

    const message = {
        user:  userNameOrId,
        fileName: fileName,
        fileNameWithFullPath:  fileNameWithFullPath,
        options: options
    }

    return await storage.addToQueueAsync(
        config.azstorage.connectionString, 
        userNameOrId, 
        JSON.stringify(message),
        options
        );

}

module.exports = {
    createWriteStream: createWriteStream,
    createReadStream:createReadStream,
    readFile:readFile,
    uploadFileInfoToQueueAsync: uploadFileInfoToQueueAsync
};