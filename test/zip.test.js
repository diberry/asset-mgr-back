const zip = require("../src/zip.js");
const path =require("path");
const config = require("../src/config.js");

describe('zip', () => {

    it('created zipped file', async () => {

        try{
            let testConfig = config.getConfigTest();

            const name = path.join(__dirname, "../out/jest-zip-createZipFile.zip");
      
            const fileArr = ["Born.mp3", "Died.mp3", "Today.mp3"];
            const fullPathArr = [];
      
            for (const item of fileArr) {
                fullPathArr.push ({fullLocation: path.join(testConfig.rootDir,`./data/zipOut/${item}`), name: `${item}`});
            }
        
            expect(fullPathArr.length).toEqual(3);
        
            const zipped = await zip.createZip(name, fullPathArr);
            
            expect(zipped).toBeTruthy();
        
        }catch(err){
            done(err);
        }


    });
  });