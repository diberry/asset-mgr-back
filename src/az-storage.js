const azure = require('azure-storage');


const addBlobAsync = async (storageConnectionString, container, blobname, originfileWithPath, options)=>{

    return new Promise(function(resolve, reject) {

        if (!storageConnectionString || !container || !blobname || !originfileWithPath) throw Error("az-storage::addBlobAsync - params missing");

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

    return new Promise(function(resolve, reject) {

        if (!storageConnectionString || !share || !directory || !filename || !fileWithPath) throw Error("az-storage::addFileAsync - params missing");

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

module.exports = {
    addBlobAsync:addBlobAsync,
    addFileAsync:addFileAsync,
    getFilePropertiesAsync:getFilePropertiesAsync,
    getFileUrlAsync:getFileUrlAsync
};

