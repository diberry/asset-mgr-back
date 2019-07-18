const Hash = require("../src/hash.js"),
    config = require("../src/config.js"),
    string = require("../src/strings.js");

describe('hash', () => {

    it('should manage hash', async (done) => {

        try {
            jest.setTimeout(99000);
            const testConfig = config.getConfigTest();
            const timestamp = string.dateAsTimestamp();
            const password = "password-" + timestamp;

            const hashMgr = new Hash();

            // create hash from password
            const hashedPassword = await hashMgr.create(password);
            expect(hashedPassword).not.toBe(undefined);

            // compare to original password
            const validatedPassword = await hashMgr.compare(password,hashedPassword.hash);

            expect(validatedPassword).toEqual(true);
            done();

        } catch(err){
            done(err);
        }

    });
  });