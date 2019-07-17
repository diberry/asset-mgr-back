const azure = require('azure-storage');
const bcrypt = require('bcryptjs');
const base64encode = require('base64-url');
const uuid = require('uuid/v4');

// naming rules
// https://docs.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-shares--directories--files--and-metadata#directory-and-file-names

const addBlobAsync = async (storageConnectionString, container, blobname, originfileWithPath, options)=>{

    if (!storageConnectionString || !container || !blobname || !originfileWithPath) throw Error("az-storage::addBlobAsync - params missing");

    return new Promise(function(resolve, reject) {

        const blobService = azure.createBlobService(storageConnectionString);

        blobService.createContainerIfNotExists(container.toLowerCase(), error => {
            if (error) return reject(error);
            blobService.createBlockBlobFromLocalFile(
                container.toLowerCase(),
                blobname,
                originfileWithPath,
                options,
                (error, result) => {
                if (error) return reject(error);
                return resolve(result);
                }
            );
        });
    });
}

const addFileAsync = async (storageConnectionString, share, directory, filename, fileWithPath, optionalContentSettings={}, optionalMetadata={})=>{

    if (!storageConnectionString || !share || !directory || !filename || !fileWithPath) throw Error("az-storage::addFileAsync - params missing");

    return new Promise(function(resolve, reject) {

        const fileService = new azure.FileService(storageConnectionString);

        fileService.createShareIfNotExists(share.toLowerCase(), error =>{
            if (error) return reject(error);

            fileService.createDirectoryIfNotExists(share.toLowerCase(), directory.toLowerCase(), error => {
                if (error) return reject(error);

                fileService.createFileFromLocalFile(
                    share.toLowerCase(),
                    directory.toLowerCase(),
                    filename,
                    fileWithPath,
                    { contentSettings: optionalContentSettings, metadata: optionalMetadata},
                    (error, result) => {

                    if (error) return reject(error);
                    return resolve(result);
                    
                });
            });
        });
    });
}

// message options
// http://azure.github.io/azure-storage-node/QueueService.html#createMessage__anchor
// default time to live - 7 days

const addToQueueAsync = async (storageConnectionString, queueName, messageText, messageOptions={})=>{

    if (!storageConnectionString || !queueName || !messageText ) throw Error("az-storage::addToQueueAsync - params missing");

    return new Promise(function(resolve, reject) {

        const queueService = new azure.createQueueService(storageConnectionString);

        //userNameOrIdAsQueueName = storage.applyDirectoryRules(userNameOrId);

        queueService.createQueueIfNotExists(queueName.toLowerCase(), error =>{
            if (error) return reject(error);

            queueService.createMessage(
                queueName.toLowerCase(),
                messageText,
                messageOptions,
                (error, result) => {

                if (error) return reject(error);
                return resolve(result);
                
            });

        });
    });
}

const getFilePropertiesAsync = async (storageConnectionString, share, directory, filename)=>{

    if (!storageConnectionString || !share || !directory || !filename ) throw Error("az-storage::getFilePropertiesAsync - params missing");

    return new Promise(function(resolve, reject) {

        const fileService = new azure.FileService(storageConnectionString);

        fileService.getFileProperties(share.toLowerCase(), directory.toLowerCase(), filename.toLowerCase(), (error, response) => {
            if (error) return reject(error);
            return resolve(response);
        });
    });
}
// http://azure.github.io/azure-storage-node/FileService.html#getUrl__anchor
const getFileUrlAsync = async (storageConnectionString, share, directory, filename)=>{

    if (!storageConnectionString || !share || !directory || !filename ) throw Error("az-storage::getFileUrlAsync - params missing");

    return new Promise(function(resolve, reject) {

        const fileService = new azure.FileService(storageConnectionString);
        const primaryEndpoint = true;

        var startDate = new Date();
        var expiryDate = new Date(startDate);
        expiryDate.setMinutes(startDate.getMinutes() + 5);

        const sharedAccessPolicy = {
            AccessPolicy: {
              Permissions: azure.FileUtilities.SharedAccessPermissions.READ,
              Start: startDate,
              Expiry: expiryDate
            },
          };
          
        const sasToken = fileService.generateSharedAccessSignature(share.toLowerCase(), directory.toLowerCase(), filename, sharedAccessPolicy);
          
        const url = fileService.getUrl(share.toLowerCase(), directory.toLowerCase(), filename, sasToken, primaryEndpoint);

        if(!url) reject("az-storage::getFileUrlAsync - url is empty");
        resolve(url);
    });
}

const getQueueMessageAsync = async (storageConnectionString, queueName, options={})=>{

    if (!storageConnectionString || !queueName ) throw Error("az-storage::getQueueMessagesAsync - params missing");

    return new Promise(function(resolve, reject) {

        const queueService = new azure.createQueueService(storageConnectionString);

        queueService.getMessage(queueName.toLowerCase(), options, (error, result) =>{

            if (error) return reject(error);
            return resolve(result);

        });
    });
}

const deleteQueueMessagesAsync = async (storageConnectionString, queueName, messageId, popReceipt, options={})=>{

    if (!storageConnectionString || !queueName || !messageId || !popReceipt ) throw Error("az-storage::getQueueMessagesAsync - params missing");

    return new Promise(function(resolve, reject) {

        const queueService = new azure.createQueueService(storageConnectionString);

        queueService.deleteMessage(queueName.toLowerCase(), messageId, popReceipt, options, (error, result) =>{

            if (error) return reject(error);
            return resolve(result);

        });
    });
}

const applyDirectoryRules = (name)=>{

    if (name.length>255) throw ("az-storage::applyDirectoryRules - name is over 255 char");

    name = base64encode.base64Encode(name);

    // must not contain " \ / : | < > * ?

    return name;
}

const addUniqueUserToTableAsync = async(storageConnectionString, email, password, tableName)=>{

    if(!storageConnectionString || !email || !password || !tableName) throw ("az-storage::addUserToTable, missing parameters");

    return new Promise(function(resolve, reject) {

        const tableService = azure.createTableService(storageConnectionString);

        tableService.createTableIfNotExists(tableName, function(error, result, response) {
            if (error) return reject(error);
            // result contains true if created; false if already exists

            const options = {};
            options.entityResolver = entityResolver;

            tableService.retrieveEntity(tableName, email.toLowerCase(), "login", options, function(error, result, response) {

                if ((error && error.statusCode!=404) || (response && response.statusCode==200)) return reject("user already exists");

                // don't continue if table already has this user
                //const options = {};
                //options.entityResolver = entityResolver;


                // TBD: remove sync functions
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(password, salt);

                const entGen = azure.TableUtilities.entityGenerator;
                const entity = {
                    PartitionKey: entGen.String(email.toLowerCase()),
                    RowKey: entGen.String("login"),
                    salt: entGen.String(salt),
                    hash: entGen.String(hash)
                };

                // insert unique user
                tableService.insertEntity(tableName, entity, function(error, result, response) {
                    if (error) return reject(error);
                    // result contains the ETag for the new entity
                    return resolve(result);
    
                });
            });
        });
    });
}
const entityResolver = (entity) => {
    var resolvedEntity = {};

    for(key in entity) {
        resolvedEntity[key] = entity[key]._;
    }
    return resolvedEntity;
}

const findUserFromTableAsync = async(storageConnectionString, email, tableName)=>{

    if(!storageConnectionString || !email || !tableName) throw ("az-storage::findUserFromTableAsync, missing parameters");

    return new Promise(function(resolve, reject) {

        const tableService = azure.createTableService(storageConnectionString);

        const options = {};
        options.entityResolver = entityResolver;

        tableService.retrieveEntity(tableName, email.toLowerCase(), "login", options, function(error, result, response) {
            if (error) return reject(error);
            return resolve (result);
        });
    });
}
const verifyUserPasswordFromTableAsync = async(storageConnectionString, email, password, tableName)=>{

    if(!storageConnectionString || !email || !password || !tableName) throw ("az-storage::verifyUserFromTableAsync, missing parameters");

    user = await findUserFromTableAsync(storageConnectionString, email, tableName);

    const comparison = await bcrypt.compare(password,user.hash)? true: false;

    return comparison;
}

const deleteUserFromTableAsync = (storageConnectionString, email, tableName) =>{

    if(!storageConnectionString || !email || !tableName) throw ("az-storage::verifyUserFromTableAsync, missing parameters");

    return new Promise(function(resolve, reject) {

        const tableService = azure.createTableService(storageConnectionString);

        var uniqueRow = {
            PartitionKey: {'_':email.toLowerCase()},
            RowKey: {'_': "login"}
          };
          
          tableService.deleteEntity(tableName, uniqueRow, function(error, response){
            if(error) return reject(error);
            return resolve(response);
          });
    });
}

module.exports = {
    addBlobAsync:addBlobAsync,
    addFileAsync:addFileAsync,
    getFilePropertiesAsync:getFilePropertiesAsync,
    getFileUrlAsync:getFileUrlAsync,
    applyDirectoryRules:applyDirectoryRules,
    addToQueueAsync:addToQueueAsync,
    getQueueMessageAsync:getQueueMessageAsync,
    deleteQueueMessagesAsync:deleteQueueMessagesAsync,
    addUniqueUserToTableAsync:addUniqueUserToTableAsync,
    findUserFromTableAsync: findUserFromTableAsync,
    verifyUserPasswordFromTableAsync: verifyUserPasswordFromTableAsync,
    deleteUserFromTableAsync: deleteUserFromTableAsync
};

