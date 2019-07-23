const User = require("../src/user.js"),
    config = require("../src/config.js"),
    string = require("../src/strings.js");

describe('user', () => {

    it('should manage user', async (done) => {

        try {
            jest.setTimeout(99000);
            const testConfig = config.getConfigTest();
            const timestamp = string.dateAsTimestamp();
            const user = "user-" + timestamp;
            const password = "password-" + timestamp;
            const directory = "directory-" + timestamp;

            const fileName1 = `${string.dateAsTimestamp()}_1_short.txt`;
            const fileName2 = `${string.dateAsTimestamp()}_2_short.txt`;
            const fileFullPath = path.join(testConfig.rootDir,"./data/short.txt");

            const userMgr = new User(testConfig);

            // create user
            const userAuthenticationAccount = await userMgr.create(user, password);
            expect(userAuthenticationAccount.user).toEqual(user);

            // get user
            const userAuthenticationAccount2 = await userMgr.get(user);
            expect(userAuthenticationAccount2.user).toEqual(user);

            // login user
            const userWithToken = await userMgr.login(user, password);
            expect(userWithToken.token).not.toEqual(undefined);
            expect(userWithToken.user).toEqual(user);

            // create directory - share created too
            const createUserResults = await userMgr.createDirectoryAsync(directory);
            expect(createUserResults.status.created).toEqual(true);

            // add file 1
            const addFileResults1 = await userMgr.addFileToSubdirAsync(directory, fileName1, fileFullPath);
            expect(createUserResults).not.toEqual(undefined);

            // add file 2
            const addFileResults2 = await userMgr.addFileToSubdirAsync(directory, fileName2, fileFullPath);
            expect(createUserResults).not.toEqual(undefined);

            // delete directory
            const deleteDirectory = await userMgr.deleteDirectoryAsync(directory);
            expect(deleteDirectory).not.toEqual(undefined);

            // delete share
            const wasShareDeleted = await userMgr.deleteShareAsync(user);
            expect(wasShareDeleted).toEqual(true);

            // delete user
            const wasUserDeleted = await userMgr.delete(user);
            expect(wasUserDeleted).toEqual(true);

            done();

        } catch(err){
            done(err);
        }

    });
    it('should update user', async (done) => {

        try {
            jest.setTimeout(99000);
            const testConfig = config.getConfigTest();
            const timestamp = string.dateAsTimestamp();
            const user = "user-" + timestamp;
            const password = "password-" + timestamp;
            const directory = "directory-" + timestamp;

            const fileName1 = `${string.dateAsTimestamp()}_1_short.txt`;
            const fileName2 = `${string.dateAsTimestamp()}_2_short.txt`;
            const fileFullPath = path.join(testConfig.rootDir,"./data/short.txt");

            const userMgr = new User(testConfig);

            // create user
            const userAuthenticationAccount = await userMgr.create(user, password);
            expect(userAuthenticationAccount.user).toEqual(user);

            // get user
            const userAuthenticationAccount2 = await userMgr.get(user);
            expect(userAuthenticationAccount2.user).toEqual(user);

            // create new user2
            const userMgr2 = new User(testConfig);  

            // get user 3
            const userAuthenticationAccount3 = await userMgr2.get(user);
            expect(userAuthenticationAccount3.user).toEqual(user);      

            // add file, get download URL
            let downloadURL = await userMgr2.addFileToSubdirAsync( directory, 'short.txt', fileFullPath, null, null);
            expect(downloadURL.indexOf('https://')).not.toEqual(-1);

            done();

        } catch(err){
            done(err);
        }
    });


  });