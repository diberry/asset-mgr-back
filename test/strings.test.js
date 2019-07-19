const strings = require("../src/strings.js");

describe('strings', () => {

    it('create date as timeStamp for filename',  (done) => {
        const newdate = strings.dateAsTimestamp();
        expect(typeof newdate).toEqual("string");
        var pattern = new RegExp(/^[0-9]*$/);
        let test = newdate.match(pattern);

        expect(test[0].groups).toEqual(undefined);
        done();
    });
    it('splits email',  (done) => {
        const email = "JohnDoe@Microsoft.com";
        const parts = strings.userEmailParts(email);

        expect(parts.length).toEqual(2);
        expect(parts[0]).toEqual('johndoe');
        expect(parts[1]).toEqual('microsoft.com');
        done();
    });
});        