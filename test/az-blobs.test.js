const path =require("path");
const config = require("../src/config.js");
const AzureBlobs = require("../src/az-blobs.js");
const string = require("../src/strings.js");

describe('AzureBlobs', () => {

    it.only('should add to blob container', async (done) => {

        try {
            const testConfig = config.getConfigTest();

            const fileName = `short.txt`;
            const fileFullPath = path.join(testConfig.rootDir,"./data/" + fileName);
            const options = {};

            const containername = `${string.dateAsTimestamp()}${testConfig.azstorage.container}`;
            const blobname = `${string.dateAsTimestamp()}_${fileName}`;

            const blobService = new AzureBlobs(testConfig.azstorage.connectionString);

            const blobResult = await blobService.addBlobAsync(containername, blobname, fileFullPath, options);

            expect(blobResult.lastModified).not.toEqual(undefined);
            done();

        } catch(err){
            done(err);
        }

    });

    it('should add to blob container', async (done) => {

        try {
            const testConfig = config.getConfigTest();

            // using container and file from user1

            const fileName = `short_en.mp3`;
            const sourceURI = "https://diberryassetmgrtest.file.core.windows.net/067d3c58-1332-4db5-8ed4-7a935fc91002/this-is-a-test/short_en.mp3";

            const targetContainer = "067d3c58-1332-4db5-8ed4-7a935fc91002";

            const options = undefined;
            const metadata = undefined;

            const blobService = new Blob(testConfig.azstorage.connectionString);

            const blobResult = await blobService.addBlobAsync(containername, blobname, fileFullPath, options, metadata);

            expect(blobResult.lastModified).not.toEqual(undefined);
            done();

        } catch(err){
            done(err);
        }

    });          
});  