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
  });