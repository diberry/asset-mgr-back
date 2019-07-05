const path =require("path");
const config = require("../src/config.js");
const files = require("../src/files.js");
const strings = require("../src/strings.js");

describe('files', () => {

    it('should read file', async (done) => {

        try {
            const testConfig = config.getConfigTest();
            const fileFullPath = path.join(testConfig.rootDir,"./data/short.txt");

            const text = await files.readFile(fileFullPath, "utf-8");

            expect(text).toEqual("This is a test.");
            done();

        } catch(err){
            done(err);
        }

    });
    it('should add file info to Azure Storage Queue', async (done) => {

        try {
            jest.setTimeout(99000);
            const testConfig = config.getConfigTest();
            const timestamp = strings.dateAsTimestamp();
            const userName = `jestfilesaddfiletoazurestorage${timestamp}`;

            const fileName = `${timestamp}-short.txt`;
            const fileFullPath = path.join(testConfig.rootDir,"./data/short.txt");

            const options = {
                "testing":"1",
                "results-hack":123
            }

            const results = await files.uploadFileInfoToQueueAsync(testConfig, userName, fileName, fileFullPath, options);

            expect(results.messageId).not.toEqual(undefined);
            done();

        } catch(err){
            done(err);
        }

    });
  });