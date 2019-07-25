"use strict";
const azure = require('azure-storage');
const AzureFiles = require('./az-files.js');

module.exports = class AzureBlobs {
        
    /**
     * 
     * @param {*} systemConfig - Entire config object
     */
    constructor(systemConfig, appConfig){

        if(!systemConfig) throw ("az-blobs::c'tor - missing params");

        this.appConfig = appConfig;
        this.connectionString = systemConfig;
        this.blobService = new azure.BlobService(systemConfig);
    }
    /**
     * Trim to max container length. 
     * @param {*} containerName 
     */
    trimToMaxLength(containerName){
        if(containerName.length>63){
            return containerName.substring(0,62);
        }
        return containerName;
    }
    /**
     * Gets properties, then constructs public URI for blob in `URI` property.
     * @param {*} container 
     * @param {*} blob 
     * @param {*} options 
     */
    async getBlobProperties(container, blob, options=null){

        if (!this.blobService || !container || !blob) throw Error("az-blobs::getBlobProperties - params missing");

        let self = this;

        return new Promise(function(resolve, reject) {

            self.blobService.getBlobProperties(container.toLowerCase(), blob, options, (error, result) => {

                if (error) return reject(error);

                // adding this because it isn't returned but can be constructed
                // appConfig.azstorage.container is the storage resource name
                result["URI"] = `https://${self.appConfig.azstorage.container}.blob.core.windows.net/${container}/${blob}`;

                return resolve(result);

            });
        });        
    }
    /**
     * 
     * @param {*} container 
     * @param {*} blobname (filename)
     * @param {*} originfileWithPath 
     * @param {*} options 
     * @param {*} metadata
     * @param {*} public - boolean - defaults to false - this overrides passed in value for publicAccessLevel
     * 
     * options.publicAccessLevel:'blob'
     *
     */
    async addBlobAsync(container, blobname, originfileWithPath, options, metadata, publicAccessToBlob=false){

        if (!this.blobService || !container || !blobname || !originfileWithPath) throw Error("az-blobs::addBlobAsync - params missing");
    
        if(!options){
            options = {};
        }
        if(publicAccessToBlob) options.publicAccessLevel = 'blob';
        if(metadata) options.metadata = metadata;

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
    /**
     * 
     * @param {*} originatingShare - same as dir in azureFileURI
     * @param {*} originatingFileServiceDirectory - same as dir in azureFileURI
     * @param {*} originatingFileServiceFile - same as file in azureFileURI
     * @param {*} originatingFileServiceAccessPermissions - default to readonly for 5 min
     * @param {*} azureFileURI 
     * @param {*} targetContainer - same as dir in azureFileURI, will be prepended with `pub-`
     * @param {*} targetBlob - same as file in azureFileURI
     * @param {*} options - defaults for copy to blob only
     * @param {*} metadata - metadata for blob only
     */
    async copyFileToBlobAsync(originatingShare, originatingFileServiceDirectory, originatingFileServiceFile, originatingFileServiceAccessPermissions=null, azureFileURI,  targetContainer, targetBlob, options, metadata){

        if (!this.appConfig || !this.blobService || !originatingShare || !originatingFileServiceDirectory || !originatingFileServiceFile || !azureFileURI || !targetContainer || !targetBlob ) throw Error("az-blobs::copyFileToBlobAsync - params missing");
    
        if(!options)options = {};
        if(metadata)options.metadata = metadata;

        let self = this;

        // Assumes File Share is exactly the same as Blob Container
        // if there isn't an access token, create one
        if(azureFileURI.indexOf('?st=') == -1){
            
            const azureFiles = new AzureFiles(self.appConfig, originatingShare);
            const accessToken = azureFiles.getAccessToken(originatingFileServiceDirectory, originatingFileServiceFile);

            if(!accessToken)throw "az-blobs::copyFileToBlobAsync - can't get access token";

            // TBD: is the question mark already in the accessToken
            azureFileURI = `${azureFileURI}?${accessToken}`;
        }

        return new Promise(function(resolve, reject) {
    
            // blob will be publicly accessible
            // container will not return a public listing
            const containerOptions = {
                publicAccessLevel: 'blob'
            };

            self.blobService.createContainerIfNotExists(targetContainer, containerOptions, error => {

                if (error) return reject(error);

                self.blobService.startCopyBlob(azureFileURI, targetContainer, targetBlob, null, (error, result) => {

                    if (error) return reject(error);

                    return resolve(result);
                });
            });
        });
    }
}