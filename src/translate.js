const rp = require('request-promise'),
    uuid = require('uuid/v4');
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

        if(!config || !config.host ||!config.key ||!config.textArray || !config.to) throw ("translate::translate - missing required params");

        const options =  {
            method: 'POST',
            baseUrl: `https://${config.host}/`,
            url: 'translate',
            qs: {
                'api-version': '3.0',
                'to': config.to //array of cultures
            },
            headers: {
            'Ocp-Apim-Subscription-Key': config.key,
            'Content-type': 'application/json',
            'X-ClientTraceId': uuid().toString()
            },
            body: config.textArray,
            json: true,
            useQuerystring: true
        }

        return await rp(options);

    } catch (err){
        throw err;
    }
}
const detectLanguage = async (config) =>{
    try{

        if(!config ||!config.host ||!config.key ||!config.textArray) throw ("translate::translate - missing required params");

        const options =  {
            method: 'POST',
            baseUrl:  `https://${config.host}/`,
            url: 'detect',
            qs: {
                'api-version': '3.0',
            },
            headers: {
            'Ocp-Apim-Subscription-Key': config.key,
            'Content-type': 'application/json',
            'X-ClientTraceId': uuid().toString()
            },
            body: config.textArray,
            json: true,
            useQuerystring: true
        }

        return await rp(options);

    } catch (err){
        throw err;
    }
}
/**
 * 
 * @param {*} jsonFromTranslate 
 * @returns array of Obj: {to:culture, text:translatedToBasedOnToCulture}
 */
const getTranslations =  (jsonFromTranslate) =>{

    if(!jsonFromTranslate) throw ("translate::getTranslations - missing required params");

    try{
        
        if(!jsonFromTranslate || !jsonFromTranslate[0] || !jsonFromTranslate[0].translations || jsonFromTranslate[0].translations.length==0) return [];

        return jsonFromTranslate[0].translations;

    } catch (err){
        throw err;
    }
}
/**
 * 
 * @param {*} jsonFromGetTranslations 
 * @returns array of unique culture strings
 */
const getUniqueCultures = (jsonFromGetTranslations) =>{
    
    if(!jsonFromGetTranslations) throw ("translate::getUniqueCultures - missing required params");

    try{
        if(!jsonFromGetTranslations || jsonFromGetTranslations.length==0)return [];

        const unique = [...new Set(jsonFromGetTranslations.map(item => item.to))];

        return unique.sort();

    } catch (err){
        throw err;
    }
}

module.exports = {
    translate: translate,
    getTranslations: getTranslations,
    getUniqueCultures:getUniqueCultures,
    detectLanguage:detectLanguage
};