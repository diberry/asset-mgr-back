const path =require("path");
const config = require("../src/config.js");
const azStorage = require("../src/az-storage.js");
const string = require("../src/strings.js");



describe('az-storage', () => {

    describe('queue messages', () => {

        it('should add/get/delete queue message', async (done) => {

            try {
                jest.setTimeout(99000);
                const timestamp = string.dateAsTimestamp();

                const testConfig = config.getConfigTest();

                const queue = `test${timestamp}`;
                const message = `jest test ${timestamp}`;
                const options = {
                    clientRequestId: "diberry"
                };

                // create message
                const createMessageResult = await azStorage.addToQueueAsync(testConfig.azstorage.connectionString, queue, message, options);
                    
                expect(createMessageResult.messageId).not.toEqual(undefined);

                // get message
                const getMessageResult = await azStorage.getQueueMessageAsync(testConfig.azstorage.connectionString, queue, options);
                    
                expect(getMessageResult.messageId).not.toEqual(undefined);
                expect(getMessageResult.messageText).toEqual(message);

                // delete message
                const deleteMessageResult = await azStorage.deleteQueueMessagesAsync(testConfig.azstorage.connectionString, queue, getMessageResult.messageId, getMessageResult.popReceipt, options);
                    
                expect(deleteMessageResult.isSuccessful).toEqual(true);

                done();

            } catch(err){
                done(err);
            }

        });    
    });  
    
    describe('table-user', () => {
        
        it('should manage new user to table properly', async (done) => {

            try{

                jest.setTimeout(99000);
                const timestamp = string.dateAsTimestamp();

                const testConfig = config.getConfigTest();

                const tableName = `usertest${timestamp}`;
                const email = "JohnDoe@Microsoft.com";
                const password = "password";

                // add User
                const addUserResult = await azStorage.addUniqueUserToTableAsync(testConfig.azstorage.connectionString, email, password, tableName);

                expect(addUserResult).not.toEqual(undefined);

                // verify User's password
                const verified = await azStorage.verifyUserPasswordFromTableAsync(testConfig.azstorage.connectionString, email, password, tableName);
                    
                expect(verified).toEqual(true);

                // delete User
                const deleted = await azStorage.deleteUserFromTableAsync(testConfig.azstorage.connectionString, email, tableName);

                expect(deleted.statusCode).toEqual(204);  

                done();

            } catch(err){
                done(err);
            }                          
        });

        it('should error when adding duplicate user to table', async (done) => {

            try{

                jest.setTimeout(99000);
                const timestamp = string.dateAsTimestamp();

                const testConfig = config.getConfigTest();

                const tableName = `usertest${timestamp}`;
                const email = "JohnDoe@Microsoft.com";
                const password = "password";

                // add User
                const addUserResult1 = await azStorage.addUniqueUserToTableAsync(testConfig.azstorage.connectionString, email, password, tableName);

                expect(addUserResult1).not.toEqual(undefined);

                const addUserResult2 = await azStorage.addUniqueUserToTableAsync(testConfig.azstorage.connectionString, email, password, tableName);  

                done("allowed duplicate error to be added");

            } catch(err){
                // success!
                expect(err).toEqual("user already exists");
                done();
            }                          
        });
    });
  });