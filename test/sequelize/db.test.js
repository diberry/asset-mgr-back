const Database = require("../../src/sequelize/db.js");
const config = require("../../src/config.js");



describe('sequelize db', () => {

    it.only('should test connection', async (done) => {

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
});
