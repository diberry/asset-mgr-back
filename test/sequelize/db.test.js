const Database = require("../../src/sequelize/db.js");
//const config = require("../../src/config.js");



describe('sequelize db', () => {

    it.only('should test connection', (done) => {

        try{
            const db = new Database();
            db.doSomething();
            
            done();
        } catch (err){
            done(err);
        }

    });
});
