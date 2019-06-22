const zip = require("../src/zip.js");
const path =require("path");
const config = require("../src/config.js");
const files = require("../src/files.js");
const strings = require("../src/strings.js");

describe('zip', () => {

    it('created zipped file', async (done) => {

        try{
            jest.setTimeout(200000);
            let testConfig = config.getConfigTest();

            const zipFilenameAndPath = path.join(__dirname, `../out/jest-zip-createZipFile-${strings.dateAsTimestamp()}.zip`);
      
            const fileArr = ["Born.mp3", "Died.mp3", "Today.mp3"];
            const fullPathArr = [];
      
            for (const item of fileArr) {
                const fileFullPath = path.join(testConfig.rootDir,`./data/zipOut/${item}`);
                fullPathArr.push ({fullLocation: fileFullPath, name: `${item}`});
            }
        
            expect(fullPathArr.length).toEqual(3);
        
            await zip.createZip(zipFilenameAndPath, fullPathArr);
         
            // TBD: should test to make sure each file is in zip

            done();
        
        }catch(err){
            done(err);
        }


    });
  });