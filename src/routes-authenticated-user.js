"use strict";
const User = require('./user.js');
const uuid = require('uuid/v4');
const fs = require("fs").promises;
const translator = require('./translate.js');

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
        answer.files = [];

        // get user
        const user = new User(req.app.config);
        const returnedUserObj = await user.get(req.user);

        if(!returnedUserObj) throw("routes-authenticated::uploadFiles - can't get authenticated user");
        
        // file name
        let localFileName = req.files.files.name;
        let localFileNameParsed = path.parse(localFileName);

        // path
        let localPathForOriginalFile = path.join(req.app.config.rootDir, `./${req.app.config.upload.processingDir}/${returnedUserObj.UID}_${localFileName}`);

        // move and rename file
        await req.files.files.mv(localPathForOriginalFile);

        // read file contents
        // assuming UTF-8 for now
        const text = await fs.readFile(localPathForOriginalFile, "UTF-8");

        // get culture
        let culture = undefined;
        culture = await getCultureFromText(req.app.config.translator, text);


        // file metadata
        let optionalMetadataObj = undefined;
        if(req.body.metadata){
            optionalMetadataObj = parseMetadata(req.body.metadata);

            if(optionalMetadataObj && culture){
                Object.assign(optionalMetadataObj,{'culture':culture});
            }
    
        }

        // part the incoming file name
        let pathParts = path.parse(localPathForOriginalFile);
        pathParts.originalName = localFileNameParsed.name;
        pathParts.UID = returnedUserObj.UID;
        pathParts.metadata = optionalMetadataObj;

        // add culture to end of incoming file name
        let newFileNameWithCulture = localFileNameParsed.name + "_" + culture + pathParts.ext;

        let optionalContentSettings = undefined;

        // add file to Azure Storage Files
        const downloadURL = await user.addFileToSubdirAsync(req.body.directoryName, newFileNameWithCulture, localPathForOriginalFile, optionalContentSettings, optionalMetadataObj);

        // add incoming file to array
        answer.files.push({
            "filename": newFileNameWithCulture,
            "URL": downloadURL,
            "text": text,
            "culture":culture
        });

        // if asking for translations
        if(req.body.translations){

            let translateConfig = {};
            Object.assign(translateConfig, req.app.config.translator);
            translateConfig.to = req.body.translations;
            translateConfig.textArray = [{'text': text}];

            // translate text
            const translatorResponse = await translator.translate(translateConfig);

            for(const translation of translatorResponse[0].translations){

                // create file name that indicates new culture
                const culturedFileName = `${pathParts.UID}_${pathParts.originalName}_${translation.to}${pathParts.ext}`;
                
                const displayFileName = `${pathParts.originalName}_${translation.to}${pathParts.ext}`;

                // create local file path 
                const localPathAndCulturedFileName = path.join(pathParts.dir, culturedFileName);

                // save translated text to local file 
                await fs.writeFile(localPathAndCulturedFileName, translation.text, 'utf-8');

                // add culture to metadata
                pathParts.metadata.culture = translation.to;
                
                let optionalContentSettings = undefined;

                // add file to Azure Storage Files
                const downloadURL = await user.addFileToSubdirAsync(req.body.directoryName, displayFileName, localPathAndCulturedFileName, optionalContentSettings, pathParts.metadata);

                // add incoming file to array
                answer.files.push({
                    "filename": displayFileName,
                    "URL": downloadURL,
                    "text": translation.text,
                    "culture":translation.to
                });
            };
        }

        return res.status(200).send(answer);

    } catch(err){
        next(err);
    }
    
}
const getCultureFromText = async (translatorConfig, text) => {

    if (!translatorConfig || !text) throw ("routes-authenticated-user::getCultureFromText - missing params");

    translatorConfig.textArray = [{"text":text}];

    // get culture
    const detectLanguageResult = await translator.detectLanguage(translatorConfig);

    if(detectLanguageResult && detectLanguageResult.length>0 && detectLanguageResult[0].language) {
        return detectLanguageResult[0].language;
    }
    
    return undefined;
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