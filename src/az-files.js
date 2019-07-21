"use strict";
const azure = require('azure-storage');

/**
 * Share == user
 * Directory == user selects
 * 
 * 
 * 
 * https://github.com/Azure-Samples/storage-file-node-getting-started
 * * - What is a Storage Account - http://azure.microsoft.com/en-us/documentation/articles/storage-whatis-account/
* - Getting Started with File - https://azure.microsoft.com/en-us/documentation/articles/storage-dotnet-how-to-use-files/
* - File Service Concepts - http://msdn.microsoft.com/en-us/library/dd179376.aspx 
* - File Service REST API - https://msdn.microsoft.com/en-us/library/dn167006.aspx
* - File Service Node API - http://azure.github.io/azure-storage-node/FileService.html
* - Delegating Access with Shared Access Signatures - http://azure.microsoft.com/en-us/documentation/articles/storage-dotnet-shared-access-signature-part-1/
*
 */
module.exports = class AzureFiles {
        
    constructor(systemConfig, user){

        if(!systemConfig || !systemConfig.azstorage || !systemConfig.azstorage.connectionString || !user) throw ("az-files::Files::c'tor - missing params");

        this.share = user.trim().toLowerCase();

        this.fileService = new azure.FileService(systemConfig.azstorage.connectionString);
    }

    async getFilePropertiesAsync(directory, filename){

        let self = this;

        if (!directory || !filename ) throw Error("az-files::Files::getFilePropertiesAsync - params missing");
    
        return new Promise(function(resolve, reject) {
    
            self.fileService.getFileProperties(self.share, directory.toLowerCase(), filename.toLowerCase(), (error, response) => {
                if (error) return reject(error);
                return resolve(response);
            });
        });
    }
    // http://azure.github.io/azure-storage-node/FileService.html#getUrl__anchor
    async getFileUrlAsync(directory, filename){
    
        let self = this;

        if (!directory || !filename ) throw Error("az-files::Files::getFileUrlAsync - params missing");
    
        return new Promise(function(resolve, reject) {
    
            var startDate = new Date();
            var expiryDate = new Date(startDate);
            expiryDate.setMinutes(startDate.getMinutes() + 5);
            const usePrimaryEndpoint = true;
            const shareSnapshot = undefined;
    
            const sharedAccessPolicy = {
                AccessPolicy: {
                  Permissions: azure.FileUtilities.SharedAccessPermissions.READ,
                  Start: startDate,
                  Expiry: expiryDate
                },
              };
              
            const sasToken = self.fileService.generateSharedAccessSignature(self.share, directory.toLowerCase(), filename, sharedAccessPolicy);
              
            const url = self.fileService.getUrl(self.share, directory.toLowerCase(), filename, sasToken, usePrimaryEndpoint, shareSnapshot);
    
            if(!url) reject("az-files::Files::getFileUrlAsync - url is empty");
            resolve(url);
        });
    }
    
    async addFileAsync(directory, filename, fileWithPath, optionalContentSettings={}, optionalMetadata={}){

        let self = this;

        if (!directory || !filename || !fileWithPath) throw Error("az-files::Files::addFileAsync - params missing");
    
        return new Promise(function(resolve, reject) {
    
            self.fileService.createShareIfNotExists(self.share, error =>{
                if (error) return reject(error);
    
                self.fileService.createDirectoryIfNotExists(self.share, directory.toLowerCase(), error => {
                    if (error) return reject(error);
    
                    self.fileService.createFileFromLocalFile(
                        self.share,
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
        
    // Base directory denoted with empty string
    // https://github.com/Azure-Samples/storage-file-node-getting-started/blob/master/fileSample.js
    async getDirectoriesAndFilesAsync(directory){

        let continuationToken = 1;
        let items = { files: [], directories: []};  
        let result = undefined;

        const azFileOptions = null;

        while(continuationToken){

            result = await this.listDirectoriesAndFilesAsync(directory, continuationToken, azFileOptions);

            // files
            items.files.push.apply(items.files, result.entries.files);

            // directories
            items.directories.push.apply(items.directories, result.entries.directories);

            continuationToken = result.continuationToken;
        }
        return items;
    }
    // private to class
    async listDirectoriesAndFilesAsync(directory, token, options) {

        if (!token) throw Error("az-files::Files::listDirectoriesAndFilesAsync - params missing");

        let self = this;
   
        return new Promise(function(resolve, reject) {
    
       
            self.fileService.listFilesAndDirectoriesSegmented(self.share, directory, token, options, function(error, result) {

                if(error) return reject(error);
                
                return resolve(result);

            });
        });
    }
    async deleteAllFilesInDirectoryAsync(directory){

        if (!directory) throw Error("az-files::Files::deleteAllFilesInDirectoryAsync - params missing");

        const resultsGetFiles = await this.getDirectoriesAndFilesAsync(directory);
    
        const options = undefined;
        let deleteFileResults = [];

        for(let i=0; i<resultsGetFiles.files.length; i++ ){
            const file = resultsGetFiles.files[i];
            let deleteFileResult = await this.deleteFileAsync(directory, file.name, options);
            deleteFileResults.push({'name':file.name, 'status': deleteFileResult, 'properties':file});
        }
        return deleteFileResults;

    }
    // deleted later during garbage collection
    async deleteFileAsync(directory, file, options){


        if (!directory || !file ) throw Error("az-files::Files::deleteFileAsync - params missing");

        let self = this;
   
        return new Promise(function(resolve, reject) {
       
            self.fileService.deleteFileIfExists(self.share, directory, file, options, function(error, result) {

                if(error) return reject(error);
                
                // result: boolean
                return resolve(result);

            });
        });
    }
    // The directory must be empty before it can be deleted.
    async deleteDirectoryAsync(directory, options){
        if (!directory) throw Error("az-files::Files::deleteDirectoryAsync - params missing");

        let self = this;

        let deleteAllFilesResults = await self.deleteAllFilesInDirectoryAsync(directory);
        console.log("files deleted");

        return new Promise(function(resolve, reject) {
    
            self.fileService.deleteDirectoryIfExists(self.share, directory, options, function(error, result) {

                if(error) return reject(error);
                
                // result: boolean
                return resolve({'directory':directory, 'status': result, 'files':deleteAllFilesResults, 'operation':'delete'});

            });
        });
    }
}
