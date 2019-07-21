const azure = require('azure-storage');

/**
 * Share == user
 * Directory == user selects
 */
module.exports = class AzureFiles {
        
    constructor(systemConfig, user){

        if(!systemConfig || !systemConfig.azstorage || !systemConfig.azstorage.connectionString || !user) throw ("az-files::Files::c'tor - missing params");

        this.connectionString = systemConfig.azstorage.connectionString;

        this.share = user.trim().toLowerCase();
    }

    async getFilePropertiesAsync(directory, filename){

        let self = this;

        if (!directory || !filename ) throw Error("az-files::Files::getFilePropertiesAsync - params missing");
    
        return new Promise(function(resolve, reject) {
    
            const fileService = new azure.FileService(self.connectionString);
    
            fileService.getFileProperties(self.share, directory.toLowerCase(), filename.toLowerCase(), (error, response) => {
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
    
            const fileService = new azure.FileService(self.connectionString);
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
              
            const sasToken = fileService.generateSharedAccessSignature(self.share, directory.toLowerCase(), filename, sharedAccessPolicy);
              
            const url = fileService.getUrl(self.share, directory.toLowerCase(), filename, sasToken, primaryEndpoint);
    
            if(!url) reject("az-files::Files::getFileUrlAsync - url is empty");
            resolve(url);
        });
    }
    
    async addFileAsync(directory, filename, fileWithPath, optionalContentSettings={}, optionalMetadata={}){

        let self = this;

        if (!directory || !filename || !fileWithPath) throw Error("az-files::Files::addFileAsync - params missing");
    
        return new Promise(function(resolve, reject) {
    
            const fileService = new azure.FileService(self.connectionString);
    
            fileService.createShareIfNotExists(self.share, error =>{
                if (error) return reject(error);
    
                fileService.createDirectoryIfNotExists(self.share, directory.toLowerCase(), error => {
                    if (error) return reject(error);
    
                    fileService.createFileFromLocalFile(
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
    
}