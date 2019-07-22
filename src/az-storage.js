const azure = require('azure-storage');
const base64encode = require('base64-url');
const uuid = require('uuid/v4')
const Hash = require('./hash.js');

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

                // don't continue if table already has this user
                if ((error && error.statusCode!=404) || (response && response.statusCode==200)) return reject("user already exists");


                // TBD: remove sync functions
                //const salt = bcrypt.genSaltSync(10);
                //const hash = bcrypt.hashSync(password, salt);
                const hashMgr = new Hash();
                const hash = hashMgr.create(password);

                const entGen = azure.TableUtilities.entityGenerator;
                const entity = {
                    PartitionKey: entGen.String(email.toLowerCase()),
                    RowKey: entGen.String("login"),
                    salt: entGen.String(hash.salt),
                    hash: entGen.String(hash.hash),
                    UID: entGen.String(uuid())
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

    for(let key in entity) {
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

    const hash = new Hash();
    return await hash.compare(password,user.hash)? true: false;
}
/**
 * 
 * @param {*} storageConnectionString 
 * @param {*} user - string such as email
 * @param {*} tableName 
 */
const deleteUserFromTableAsync = (storageConnectionString, user, tableName) =>{

    if(!storageConnectionString || !user || !tableName) throw ("az-storage::verifyUserFromTableAsync, missing parameters");

    return new Promise(function(resolve, reject) {

        const tableService = azure.createTableService(storageConnectionString);

        var uniqueRow = {
            PartitionKey: {'_':user.toLowerCase()},
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
    applyDirectoryRules:applyDirectoryRules,
    addToQueueAsync:addToQueueAsync,
    getQueueMessageAsync:getQueueMessageAsync,
    deleteQueueMessagesAsync:deleteQueueMessagesAsync,
    addUniqueUserToTableAsync:addUniqueUserToTableAsync,
    findUserFromTableAsync: findUserFromTableAsync,
    verifyUserPasswordFromTableAsync: verifyUserPasswordFromTableAsync,
    deleteUserFromTableAsync: deleteUserFromTableAsync
};

