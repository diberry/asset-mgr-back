const rp = require('request-promise'),
    uuid = require('uuid/v4')
/**
 * 
    {
        'to': ['it','de'],
        'translatorkey': 12345,
        'textArray': [{
            'text': 'Hello World!'
        }]
    }
 */
const translate = async (config) =>{
    try{

        const options =  {
            method: 'POST',
            baseUrl: 'https://api.cognitive.microsofttranslator.com/',
            url: 'translate',
            qs: {
                'api-version': '3.0',
                'to': config.to //array of cultures
            },
            headers: {
            'Ocp-Apim-Subscription-Key': config.translatorkey,
            'Content-type': 'application/json',
            'X-ClientTraceId': uuid().toString()
            },
            body: config.textArray,
            json: true,
            useQuerystring: true
        }
        console.log(JSON.stringify(options));

        return await rp(options);

    } catch (err){
        throw err;
    }
}
const getTranslations =  (jsonFromTranslate) =>{
    try{
        
        if(!jsonFromTranslate) return;

    } catch (err){
        throw err;
    }
}

module.exports = {
    translate: translate
};