const path =require("path");
const config = require("../src/config.js");
const AzureBlobs = require("../src/az-blobs.js");
const string = require("../src/strings.js");

describe('AzureBlobs', () => {

    it('should add to blob container as private file', async (done) => {

        try {
            const testConfig = config.getConfigTest();

            const fileName = `short.txt`;
            const fileFullPath = path.join(testConfig.rootDir,"./data/" + fileName);
            const options = {};
            const timestamp = string.dateAsTimestamp();

            const blobname = `${fileName}`;

            const blobService = new AzureBlobs(testConfig.azstorage.connectionString);

            const containername = blobService.trimToMaxLength(`test-ab-067d3c58-1332-4db5-8ed4-7a935fc91002-${timestamp}`);

            const blobResult = await blobService.addBlobAsync(containername, blobname, fileFullPath, options);

            expect(blobResult.lastModified).not.toEqual(undefined);
            done();

        } catch(err){
            done(err);
        }

    });

    it('should add to blob container as public file', async (done) => {

        try {
            const testConfig = config.getConfigTest();

            const fileName = `short.txt`;
            const fileFullPath = path.join(testConfig.rootDir,"./data/" + fileName);
            const containerOptions = {
                publicAccessLevel: 'blob'
            };
            const timestamp = string.dateAsTimestamp();

            const blobname = `${fileName}`;

            const blobService = new AzureBlobs(testConfig.azstorage.connectionString);

            const containername = blobService.trimToMaxLength(`test-ab-067d3c58-1332-4db5-8ed4-7a935fc91002-${timestamp}`);

            const blobResult = await blobService.addBlobAsync(containername, blobname, fileFullPath, containerOptions);

            expect(blobResult.lastModified).not.toEqual(undefined);
            done();

        } catch(err){
            done(err);
        }

    });    

    // TBD: get access token
    it.only('should copy to blob container as public file', async (done) => {

        try {
            const testConfig = config.getConfigTest();

            // using container and file from user1
            const targetFileName = `short_en.mp3`;
            const sourceURI = `https://diberryassetmgrtest.file.core.windows.net/067d3c58-1332-4db5-8ed4-7a935fc91002/this-is-a-test/short_en.mp3`;


            const timestamp = string.dateAsTimestamp();
            const blobOptions = undefined;
            const blobMetadata = undefined;

            // for accessToken
            const originatingShare = "067d3c58-1332-4db5-8ed4-7a935fc91002";
            const originatingDirectory = "this-is-a-test";
            const originatingFile = "short_en.mp3"
            const originatingPermissions = null;

            const blobService = new AzureBlobs(testConfig.azstorage.connectionString, testConfig);

            const targetContainer = blobService.trimToMaxLength(`test-cb-${timestamp}`);

            const blobResult = await blobService.copyFileToBlobAsync(
                originatingShare, originatingDirectory, originatingFile, originatingPermissions, sourceURI, targetContainer, targetFileName, blobOptions, blobMetadata);

            expect(blobResult.lastModified).not.toEqual(undefined);

            const optionsForProperties = undefined;

            const blobProperties = await blobService.getBlobProperties(targetContainer, targetFileName, optionsForProperties);

            expect(blobProperties.lastModified).not.toEqual(undefined);
            expect(blobProperties.URI).not.toEqual(undefined);

            done();

        } catch(err){
            done(err);
        }

    });          
});  