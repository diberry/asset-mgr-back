const removeMd = require('remove-markdown'),
    uuid = require('uuid/v4'),
    path = require('path'),
    entities = require('entities'),
    base64encode = require('base64-url'),
    detect = require('detect-csv');


const tts = require('./tts.js'),
    files = require('./files.js'),
    Database = require("./sequelize/db.js"),
    translator = require('./translate.js');


// assume text isn't already encoded
const xmlEncode = async(text)=>{
    return await entities.encodeXML(text);
}

const base64Encode = async(text)=>{
    return await base64encode.encode(text);
}

const base64Decode = async(text)=>{
    return await base64encode.decode(text);
}

const processText = async (options) => {

    // TBD - add rate limit
    return await tts.mp3(options);
}
const saveFileAndReadFile = async (rootDir, processingDir, id, file) => {

    try {

        if(!rootDir || !processingDir || !id || !file) throw ("text.js::saveFileAndReadFile, missing parameters");

        // move uploaded file to this new path with new filename
        let uploadPath = path.join(rootDir, `./${processingDir}/${id}-${file.name}`);

        await file.mv(uploadPath);

        let fileText = await files.readFile(uploadPath, "utf-8");
        if (!fileText || fileText.length === 0) {
            answer.read = {
                status: "failed",
                message: "empty file"
            }
        }

        return fileText;

    } catch (err) {
        throw err;
    }

}
// TBD - this is broken  
const isTsv = async (text) => {
    return detect(text);
}
const parseKnowledgeBaseForAnswers = (options) => {
    let jsonResponse = detect(options.text);
}
// https://stackoverflow.com/questions/17275377/how-convert-tsv-to-json
// Set bunch of datas into format object
/***
 * params:
 *  datas: string
 * returns:
 *  Array<Object>
 */
const tsvToJson = (datas) => {

    try {

        if (!datas) return [];

        // Separate each lines
        let array_datas = datas.split(/\r\n|\r|\n/g);

        // Separate each values into each lines
        var detailed_datas = [];
        for (var i = 0; i < array_datas.length; i++) {
            detailed_datas.push(array_datas[i].split("\t"));
        }

        // Create index
        var index = [];
        var last_index = ""; // If the index we're reading is equal to "", it mean it might be an array so we take the last index
        for (var i = 0; i < detailed_datas[0].length; i++) {
            if (detailed_datas[0][i] == "") index.push(last_index);
            else {
                index.push(detailed_datas[0][i]);
                last_index = detailed_datas[0][i];
            }
        }

        // Separate data from index
        detailed_datas.splice(0, 1);

        // Format data
        var formated_datas = [];
        for (var i = 0; i < detailed_datas.length; i++) {
            var row = {};
            for (var j = 0; j < detailed_datas[i].length; j++) {
                // Check if value is empty
                if (detailed_datas[i][j] != "") {
                    if (typeof row[index[j]] == "object") {
                        // it's already set as an array
                        row[index[j]].push(detailed_datas[i][j]);
                    } else if (row[index[j]] != undefined) {
                        // Already have a value, so it might be an array
                        row[index[j]] = [row[index[j]], detailed_datas[i][j]];
                    } else {
                        // It's empty for now, so let's say first that it's a string
                        row[index[j]] = detailed_datas[i][j];
                    }
                }
            }
            formated_datas.push(row);
        }
        return formated_datas;
    } catch (err) {
        throw err;
    }
}

// return cleaned text
const clean = async (text, extraStringsToClean, removeEndOfLineMarks, options) => {

    if(!text) return "";

    let originString = text;

    // remove end of line marks
    if(removeEndOfLineMarks) {

        const reg1 = new RegExp( /\\n/g );
        originString = text.replace(reg1, ",");

        //const reg2 = new RegExp( /\n/g );
        //originString = originString.replace(reg2, "");
    }

    // remove markdown
    let cleanedString = removeMd(originString,options);

    // remove other marks
    cleanedString = removeStrings(cleanedString,extraStringsToClean);

    // replace double commas to single comma
    const commaReg = new RegExp(/([,]{2,})/g);
    if(cleanedString.indexOf(",,")) cleanedString = cleanedString.replace(commaReg, ","); 

    // encode non-xml - which screws up speech service
    cleanedString = await xmlEncode(cleanedString);

    return cleanedString;

}

/**
 * 
 * @param {*} kbAsJson - array of JSON objects
 * @param {pathInJsonToClean} string - used as `arrayItem[pathInJsonToClean]`
 * @returns array of new property, `cleanedAnswer`
 */
const cleanAnswersAsync = async (kbAsJson,options,pathInJsonToClean,extraStringsToClean, removeEndOfLineMarks)=>{
    
    if (!kbAsJson || (!(kbAsJson instanceof Array)) || (kbAsJson.length===0)) return [];

    for (const kb of kbAsJson) {

        if(kb[pathInJsonToClean]){
            kb[pathInJsonToClean + "_cleaned"] = await clean(kb[pathInJsonToClean], extraStringsToClean, removeEndOfLineMarks, options);
            kb["cleaned"]=true;
        } else {
            kb["cleaned"]=false;
        }
    }; 

    return kbAsJson;
}
const removeStrings = (mytext,myStringsToRemove) => {

    if(myStringsToRemove && myStringsToRemove.length>0){

        myStringsToRemove.forEach((stringToRemove, index,arr) => {
            
            mytext = mytext.replace(stringToRemove,"");
        })

    }
    return mytext;
}
const processManyRequestsFromJson = async(config) =>{
    try{
        let answer = createResponseObject(config);
        answer.results = [];

        let jsonArray = config.body["json-array"];

        for (const item of jsonArray) {


            if ((typeof item) == "string") {
                config.body.text = item;
                let thisConfig = Object.assign({}, config, {});


                // make this sync on purpose - due to tps of search service
                answer.results.push(await createAudioFile(thisConfig));
            }
        }

        answer.statusCode = 200;
        return answer;

    }catch(error){
        return {
            statusCode:  500,
            downloadURI:  undefined,
            globalerror:  error
        };        
    }
}
const processManyRequestsFromTsvFile = async(config) =>{
    try{
        let answer = createResponseObject(config);
        answer.results = [];

        let resultsArr = [];

        config.body.text = await saveFileAndReadFile(config.rootDir, config.upload.processingDir, answer.id, config.body.file);
        let jsonObj = tsvToJson(config.body.text);
        const cleanOptions = {
            stripListLeaders: true, // strip list leaders (default: true)
            listUnicodeChar: '',     // char to insert instead of stripped list leaders (default: '')
            gfm: true,                // support GitHub-Flavored Markdown (default: true)
            useImgAltText: true      // replace images with alt-text, if present (default: true)
        };
        const extraStringsToClean = ['©'];
        const removeEndOfLineMarks = true;

        // assumes QnA Maker KB only
        let cleanedJsonObject = await cleanAnswersAsync(jsonObj, cleanOptions, "Answer", extraStringsToClean, removeEndOfLineMarks);

        // reduce array to only answers
        let arrayOfTextStrings = cleanedJsonObject.map(item => {
            return item.Answer_cleaned;
        });
        config.body.type = "arrayOfStrings";
        config.body.textArray= arrayOfTextStrings;                     

        return await processArrayOfText(answer, config, config.body.textArray);

    }catch(error){
        return {
            statusCode:  500,
            downloadURI:  undefined,
            globalerror:  error
        };        
    }
}
const processArrayOfText = async (answer, config, arrayOfText)=>{
    answer.results  = [];

    for (const item of arrayOfText) {

      if ((typeof item) == "string") {
          config.body.text = item;
          let thisConfig = Object.assign({}, config, {});
          answer.results.push(await createAudioFile(thisConfig));

      }
    }

    answer.statusCode = 200;
    return answer;
}
const createAudioFile = async (config, user) =>{
    try{

        if((!config) && (!config.body.text || !config.body.file)) {
            return {
                statusCode:400,
                error:"createAudioFile = empty params"
            };
        }

        if((!config.hasOwnProperty("answer")) || (!config.answer.hasOwnProperty("id"))){
            config.answer = createResponseObject(config);
        }

        let options = {
            id: config.answer.id,
            text: config.body.text,
            path: config.download.dir,
            key: config.ttsService.key,
            region: config.ttsService.region,
            voice: config.body.voice,
            fileExtension: '.mp3',
            route: config.route
          };

        let fileProcessed = await processText(options);
        config.answer.processText = fileProcessed;
        config.answer.statusCode = 200;

        config.answer.downloadURI=`http://${config.download.host}:${config.download.port}/download/${config.answer.id}.mp3`;

        if(user){
            const resultsFile = await db.models.File.create({
                userId: user.userId, 
                fileContainer: config.azstorage.container,
                fileDirectory: user.email,
                filename: config.answer.downloadURI
            });

            user.files = await db.models.File.getByUserId(user.userId);
        }

        return Object.assign({}, config.answer, {});;
  
    } catch(err){
        return {
            statusCode:  err.response.statusCode,
            statusMessage: err.response.statusMessage,
            test: err.options.body,
            downloadURI:  undefined,
            globalerror:  err.stack
        };
    }

}
const translate = async (config) =>{
    try{
        if(!config && !config.to && !config.translatorkey && !config.textArray) throw ("text.translate params are empty");

        const translations = await translator.translate(config);

        if (config.tts && translations){
            //for each item in array, get tts in output language
            //[{"detectedLanguage":{"language":"en","score":1},"translations":[{"text":"Salve, mondo!","to":"it"},{"text":"Hallo Welt!","to":"de"}]}]
            const cultures = translations.detectedLanguage.translation.filter(val => {
                return val.to;
            })

        }

        return translations;
    } catch {

    }
}
const createResponseObject = (config)=>{
  return {
      dateTime: new Date(), 
      id: uuid(),
      ver: config.ver,
      status: null
    };
}

module.exports = {
    tsvToJson: tsvToJson,
    processText: processText,
    saveFileAndReadFile: saveFileAndReadFile,
    cleanAnswersAsync: cleanAnswersAsync,
    createResponseObject:createResponseObject,
    createAudioFile:createAudioFile,
    processManyRequestsFromJson:processManyRequestsFromJson,
    processManyRequestsFromTsvFile:processManyRequestsFromTsvFile,
    translate:translate,
    processArrayOfText: processArrayOfText,
    xmlEncode: xmlEncode,
    base64Encode: base64Encode,
    base64Decode: base64Decode
};