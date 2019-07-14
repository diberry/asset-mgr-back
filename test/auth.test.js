const jwt = require("../src/auth.js"),
    config = require("../src/config.js");
    path = require("path"),
    fs = require("fs").promises;

describe('auth', () => {

    it('should auth user', async (done) => {

        try {

            done();

        } catch(err){
            done(err);
        }

    });
    it.only('should deny user', async (done) => {

        try {
            jest.setTimeout(99000);
            const testConfig = config.getConfigTest();

            const fileFullPath = path.join(testConfig.rootDir,"./data/JSON/auth0-authorization-result.json");
            const accessBearerToken = await fs.readFile(fileFullPath, "utf-8");
            const secret = testConfig.secret;
            
            req = { };
            res = { };
            req.headers = {};
            req.headers.authorization = 'Bearer ' + accessBearerToken;

           
            jwt(secret: secret, resultProperty: 'locals.user'})(req, res, function() {
                assert.equal('bar', res.locals.user.foo);
                assert.ok(typeof req.user === 'undefined');
              });
            done();

        } catch(err){
            done(err);
        }

    });
  });