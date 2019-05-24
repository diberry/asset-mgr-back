const text = require("../src/text.js"),
    path = require("path"),
    fs = require("fs").promises;


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
})