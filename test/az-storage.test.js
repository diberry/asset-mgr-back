const path =require("path");
const config = require("../src/config.js");
const azStorage = require("../src/az-storage.js");
const string = require("../src/strings.js");

describe('az-storage', () => {

    it('should add to blob container', async (done) => {

        try {
            const testConfig = config.getConfigTest();

            const fileName = `short.txt`;
            const fileFullPath = path.join(testConfig.rootDir,"./data/" + fileName);
            const options = {};

            const containername = `${string.dateAsTimestamp()}${testConfig.azstorage.container}`;
            const blobname = `${string.dateAsTimestamp()}_${fileName}`;

            const blobResult = await azStorage.addBlobAsync(testConfig.azstorage.connectionString, containername, blobname, fileFullPath, options);

            expect(blobResult.lastModified).not.toEqual(undefined);
            done();

        } catch(err){
            done(err);
        }

    });
    it('should add file to share and container', async (done) => {

        try {
            const testConfig = config.getConfigTest();

            const fileName = `${string.dateAsTimestamp()}_short.txt`;
            const userNameAsDirectory = "diberry";
            const fileFullPath = path.join(testConfig.rootDir,"./data/short.txt");

            const optionalContentSettings = {
                contentType: undefined,
                contentEncoding: undefined,
                contentLanguage: undefined
            };

            const optionalMetadata = {
                context: "Jest-test"
            };

            const fileResult = await azStorage.addFileAsync(testConfig.azstorage.connectionString, testConfig.azstorage.container, userNameAsDirectory, fileName, fileFullPath, optionalContentSettings, optionalMetadata);

            expect(fileResult.lastModified).not.toEqual(undefined);
            done();

        } catch(err){
            done(err);
        }

    });    
    it('should get file properties', async (done) => {

        try {
            const testConfig = config.getConfigTest();

            const container = "testmaster";
            const fileName = "Short.Txt";
            const userNameAsDirectory = "diberry";


            // pass in writable stream, read back stream 
            const fileProperties = await azStorage.getFilePropertiesAsync(testConfig.azstorage.connectionString, container, userNameAsDirectory, fileName);
                 
            expect(fileProperties.share).toEqual(container);
            done();

        } catch(err){
            done(err);
        }

    });      

    it('should get download URL', async (done) => {

        try {
            const testConfig = config.getConfigTest();

            const container = "testmaster";
            const fileName = "Short.Txt";
            const userNameAsDirectory = "diberry";


            // pass in writable stream, read back stream 
            const url = await azStorage.getFileUrlAsync(testConfig.azstorage.connectionString, container, userNameAsDirectory, fileName);
                 
            expect(url.indexOf("https://")).not.toEqual(-1);
            expect(url.indexOf(container)).not.toEqual(-1);
            expect(url.indexOf(userNameAsDirectory)).not.toEqual(-1);
            expect(url.indexOf(userNameAsDirectory)).not.toEqual(-1);
            done();

        } catch(err){
            done(err);
        }

    });    

  });