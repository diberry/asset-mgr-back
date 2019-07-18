const Token = require("../src/token.js");
const config = require("../src/config.js");
const strings = require("../src/strings.js");

describe('token', () => {

    it('should create and verify token', async (done) => {

        try{
            jest.setTimeout(99000);
            const timestamp = strings.dateAsTimestamp();
            const testConfig = config.getConfigTest();

            const email = `${timestamp}-email`;
            const password = `${timestamp}-password`;

            const user = {
                email: email,
                id: timestamp
            };

            const token = new Token(testConfig.secret);

            // create token
            const newToken = await token.createTokenAsync(user); 

            expect(newToken).not.toEqual(undefined);

            // decode token
            const returned = await token.verifyTokenAsync(newToken);

            expect(returned.validToken).toEqual(true);
            expect(returned.user.email).toEqual(user.email);
            expect(returned.user.id).toEqual(user.id);
            expect(returned.user.iat).not.toEqual(undefined);
            expect(returned.user.exp).not.toEqual(undefined);

            done();
        } catch (err){
            done(err);
        }

    }); 
});
