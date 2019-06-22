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
});        