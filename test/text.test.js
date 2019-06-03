const text = require("../src/text.js"),
    path = require("path"),
    fs = require("fs").promises;

require('dotenv').config();

describe('text fns', () => {
    it('should clean a kbAsJson array of markdown', async(done)=>{

        try{
            const testDataOutputLocation = path.join(__dirname,"../kb.json");
            const savedJsonAsText = await fs.readFile(testDataOutputLocation,"utf-8");
            const kbAsJson = JSON.parse(savedJsonAsText);

            const options = {
                stripListLeaders: true , // strip list leaders (default: true)
                listUnicodeChar: '',     // char to insert instead of stripped list leaders (default: '')
                gfm: true,                // support GitHub-Flavored Markdown (default: true)
                useImgAltText: true      // replace images with alt-text, if present (default: true)
            };

            // 169 - copyright

            const extraStringsToClean = ['©'];
            const removeEndOfLineMarks = true;

            let cleanedArray = text.cleanAnswers(kbAsJson, options, "Answer",extraStringsToClean,removeEndOfLineMarks);

            expect(cleanedArray.length).toEqual(kbAsJson.length);
            expect(cleanedArray[0].Answer_cleaned).toEqual("With Windows 10,Published: September 2016 ,Version 2.0 , 2016 Microsoft. All rights reserved. ,Microsoft, Microsoft Edge, OneNote, Outlook, PowerPoint, OneDrive, and Windows are registered trademarks of Microsoft Corporation. ,Surface and Skype are trademarks of Microsoft Corporation. ,Bluetooth is a registered trademark of Bluetooth SIG, Inc. ,This document is provided “as-is.” Information in this document, including URL and other Internet website references, may change without notice.");
            done();
        } catch(err){
            done(`err = ${JSON.stringify(err)}`);
        }

    });
    it('should return convert tsv to JSON', async (done) => {
        try{
            const testDataInputLocation = path.join(__dirname,"../kb.tsv");
            const testDataOutputLocation = path.join(__dirname,"../kb.json");

            const tsvText = await fs.readFile(testDataInputLocation,"utf-8");
            const savedJsonAsText = await fs.readFile(testDataOutputLocation,"utf-8");

            const jsonFromTsv = text.tsvToJson(tsvText);

            expect(jsonFromTsv.length).toEqual(79);
            expect(JSON.stringify(jsonFromTsv)).toEqual(savedJsonAsText);
            done();
        } catch (err){
            
            done(`err = ${JSON.stringify(err)}`);
        }
    });
    it('should get all languages returned', async (done) => {
        try{

            const config = {
                'to': ['it','de'],
                'translatorkey': process.env.TRANSLATORKEY,
                'textArray': [{
                    'text': 'Hello World!'
                }]
            };

            const translations = await text.translate(config);

            expect(translations.length).toBe(1);
            expect(translations[0].translations.length).toBe(2);
            done();
        } catch (err){
            
            done(`err = ${JSON.stringify(err)}`);
        }
    });
});