"use strict";
const azure = require('azure-storage');

module.exports = class AzureBlobs {
        
    /**
     * 
     * @param {*} systemConfig - Azure Storage connection string
     */
    constructor(systemConfig){

        if(!systemConfig) throw ("az-blobs::c'tor - missing params");

        this.blobService = new azure.BlobService(systemConfig);
    }
    /**
     * 
     * @param {*} container 
     * @param {*} blobname (filename)
     * @param {*} originfileWithPath 
     * @param {*} options 
     * @param {*} metadata
     * 
     * options.publicAccessLevel:'blob'
     *
     */
    async addBlobAsync(container, blobname, originfileWithPath, options, metadata){

        if (!this.blobService || !container || !blobname || !originfileWithPath) throw Error("az-blobs::addBlobAsync - params missing");
    
        if(!options)options = {};
        if(metadata)options.metadata = metadata;

        let self = this;

        return new Promise(function(resolve, reject) {

            self.blobService.createContainerIfNotExists(container.toLowerCase(),options, error => {

                if (error) return reject(error);

                self.blobService.createBlockBlobFromLocalFile(
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
    async copyFileToBlobAsync(azurreFileURI, targetContainer, targetBlob, options, metadata){

        if (!storageConnectionString || !azurreFileURI || !targetContainer || !targetBlob || !originfileWithPath) throw Error("az-blobs::copyFileToBlobAsync - params missing");
    
        if(!options)options = {};
        if(metadata)options.metadata = metadata;

        return new Promise(function(resolve, reject) {
    
            const blobService = azure.createBlobService(storageConnectionString);

            blobService.startCopyBlob(azureFileUri, targetContainer.toLowerCase(), targetBlob, options, (error, result) => {
                if (error) return reject(error);
                return resolve(result);
            });
        });
    }
}