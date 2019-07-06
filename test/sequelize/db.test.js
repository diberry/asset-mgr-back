const Database = require("../../src/sequelize/db.js");
const config = require("../../src/config.js");
const strings = require("../../src/strings.js");

describe('sequelize db', () => {

    it('should test connection', async (done) => {

        try{
            const testConfig = config.getConfigTest();
            const db = new Database(                
                testConfig.azdb[0].host,
                testConfig.azdb[0].catalog,
                testConfig.azdb[0].user,
                testConfig.azdb[0].pwd);
            const results = await db.testConnection();
            
            done();
        } catch (err){
            done(err);
        }

    });
    it('should create user', async (done) => {

        try{
            const timestamp = strings.dateAsTimestamp();
            const testConfig = config.getConfigTest();
            const db = new Database(                
                testConfig.azdb[0].host,
                testConfig.azdb[0].catalog,
                testConfig.azdb[0].user,
                testConfig.azdb[0].pwd);

            const email = `${timestamp}-email`;
            const name = `${timestamp}-name`;

            const results = await db.models.User.create({email:email,name:name});
            
            done();
        } catch (err){
            done(err);
        }

    });    
});
