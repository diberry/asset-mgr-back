const path =require("path");
const config = require("../src/config.js");
const AzureFiles = require("../src/az-files.js");
const string = require("../src/strings.js");



describe('AzureFiles', () => {

        it('should manage file', async (done) => {

            try {
                const testConfig = config.getConfigTest();

                const fileName = `${string.dateAsTimestamp()}_short.txt`;
                const userName = `jest-share-${string.dateAsTimestamp()}`;
                const directory = `jest-dir-${string.dateAsTimestamp()}`;
                const fileFullPath = path.join(testConfig.rootDir,"./data/short.txt");

                const optionalContentSettings = {
                    contentType: undefined,
                    contentEncoding: undefined,
                    contentLanguage: undefined
                };

                const optionalMetadata = {
                    context: "Jest-test"
                };

                const fileAzure = new AzureFiles(testConfig, userName);

                // add file
                const fileResult = await fileAzure.addFileAsync(directory, fileName, fileFullPath, optionalContentSettings, optionalMetadata);
                expect(fileResult.lastModified).not.toEqual(undefined);

                // get file properties
                const fileProperties = await fileAzure.getFilePropertiesAsync(directory, fileName);
                expect(fileProperties.share).toEqual(userName);

                // get file download
                const url = await fileAzure.getFileUrlAsync(directory, fileName);     
                expect(url.indexOf("https://")).not.toEqual(-1);
                expect(url.indexOf(userName)).not.toEqual(-1);
                expect(url.indexOf(directory)).not.toEqual(-1);
                expect(url.indexOf(fileName)).not.toEqual(-1);
                    
                done();

            } catch(err){
                done(err);
            }

        });           
    });  


