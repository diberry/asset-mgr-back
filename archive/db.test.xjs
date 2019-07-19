const Database = require("../../src/sequelize/db.js");
const config = require("../src/config.js");
const strings = require("../src/strings.js");

describe('sequelize db', () => {

    xit('should test connection', async (done) => {

        try{
            jest.setTimeout(99000);
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
    xit('should create user', async (done) => {

        try{
            jest.setTimeout(99000);
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

            const user = await db.models.User.getByEmail(email);
            
            expect(user).not.toEqual(undefined);
            expect(user.length).toEqual(1);
            expect(user[0].email).toEqual(email);

            done();
        } catch (err){
            done(err);
        }

    }); 
    xit('should create file', async (done) => {

        try{
            jest.setTimeout(99000);
            const timestamp = strings.dateAsTimestamp();
            const testConfig = config.getConfigTest();
            const db = new Database(                
                testConfig.azdb[0].host,
                testConfig.azdb[0].catalog,
                testConfig.azdb[0].user,
                testConfig.azdb[0].pwd);

            const fileContainer = `${timestamp}-container`;
            const fileDirectory = email = `${timestamp}-email`;
            const filename = `${timestamp}-filename.mp3`;
            const username = `${timestamp}-name`;

            const resultsUser = await db.models.User.create({ 
                email: email, 
                name: username});

            const users = await db.models.User.getByEmail(email);
            
            expect(users).not.toEqual(undefined);
            expect(users.length).toEqual(1);
            expect(users[0].email).toEqual(email);

            const resultsFile = await db.models.File.create({
                userId: users[0].userId, 
                fileContainer: fileContainer,
                fileDirectory: fileDirectory,
                filename: filename
            });

            const files = await db.models.File.getByUserId(users[0].userId);
            
            expect(files).not.toEqual(undefined);
            expect(files.length).toEqual(1);
            expect(files[0].userId).toEqual(users[0].userId);    
            expect(files[0].filename).toEqual(filename);         

            done();
        } catch (err){
            done(err);
        }

    });       
});
