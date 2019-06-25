const server = require("../src/server.js");

describe('server.get', () => {
    it('should return error if no parameters passed', async (done) => {
        try{
            let app = server.get();
            expect(app).not.toEqual(undefined);
            expect(app.config).not.toEqual(undefined);
            expect(app.config.port).toEqual("3010");
            done();
        } catch (err){
            done(err);
        }
    });
});