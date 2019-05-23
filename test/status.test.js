const server = require("../src/server.js");
require('dotenv').config();

const config = {
    port: process.env.DFBAPISERVERPORT,
    rootDir: __dirname,
    ver: process.env.DFBAPISERVERVER,
    downloadDir: process.env.DFBAPISERVERPUBLICDOWNLOAD,
    ttsService: {
        region: process.env.SPEECHREGION,
        key: process.env.SPEECHKEY
    }
};

it('should return error of no parameters passed', async (done) => {
    try{
        const returnedServer = server.start();
        done("no parameters passed");
    } catch (err){
        expect(err).toEqual("config is empty");
        done();
    }
})