const translator = require("../src/translate.js");
const uuid = require('uuid/v4');
require('dotenv').config();

describe('translate', () => {
    it('should succeed', async (done) => {
        try{

            const config = {
                'to': ['it','de'],
                'translatorkey': process.env.TRANSLATORKEY,
                'textArray': [{
                    'text': 'Hello World!'
                }]
            };
            
            let json = await translator.translate(config);
            
            expect(json).not.toEqual(undefined);
            expect(json[0]).not.toEqual(undefined);
            expect(json[0].translations).not.toEqual(undefined);
            expect(json[0].translations[0]).not.toEqual(undefined);
            expect(json[0].translations[0].text).toEqual( "Salve, mondo!");
            done();
        } catch (err){
            done(err);
        }
    });
});