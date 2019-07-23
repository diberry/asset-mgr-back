const translator = require("../src/translate.js");
const config = require("../src/config.js");

describe('translate', () => {
    it('should translate', async (done) => {
        try{

            const testConfig = config.getConfigTest();

            const testProperties = {
                'to': ['it','de'],
                'textArray': [
                    {'text':'Hello World!'}
                ]
            };

            Object.assign(testConfig, testProperties);
            
            let translationResults = await translator.translate(testConfig);

            expect(translationResults).not.toEqual(undefined);
            expect(translationResults[0]).not.toEqual(undefined);
            expect(translationResults[0].translations).not.toEqual(undefined);
            expect(translationResults[0].translations.length).toEqual(2);
            expect(translationResults[0].translations[0].text).toEqual( "Salve, mondo!");
            expect(translationResults[0].translations[1].text).toEqual( "Hallo Welt!");

            let uniqueCultures = await translator.getUniqueCultures(translationResults[0].translations);

            expect(uniqueCultures).not.toEqual(undefined);
            expect(uniqueCultures.length).toEqual(2);
            expect(uniqueCultures.indexOf('it')).not.toEqual(-1);
            expect(uniqueCultures.indexOf('de')).not.toEqual(-1);

            done();
        } catch (err){
            done(err);
        }
    });
    it('should detect culture from text', async (done) => {
        try{

            const testConfig = config.getConfigTest();

            [{
                'text': 'Salve, mondo!'
          }]

            const testProperties = {
                'textArray': [
                    {'text':"one"}, 
                    {'text':"hola"}, 
                    {'text':"bien"},
                    {'text':"da"}
                ]
            };

            Object.assign(testConfig, testProperties);    
            
            let json = await translator.detectLanguage(testConfig);

            expect(json).not.toEqual(undefined);
            expect(json.length).toEqual(4);

            let jsonAsString = JSON.stringify(json.map(x => x.language).sort());
            let expectedAsString = JSON.stringify(["en", "es", "fr", "pt"].sort());

            expect(jsonAsString).toEqual(expectedAsString);

            done();
        } catch (err){
            done(err);
        }
    });    
});