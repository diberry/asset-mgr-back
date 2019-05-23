const rp = require('request-promise');
const fs = require('fs');

// Gets an access token.
const getAccessToken = async (region, subscriptionKey) => {
    try{
        let options = {
            method: 'POST',
            uri: `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey
            }
        }
        return rp(options);
    } catch(err){
        console.log("getAccessToken error " + err);
    }

}
// https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support
const getVoice = (voice) => {

    switch(voice.code){
        case "BenjaminRUS": 
            return {
            "gender" : "male",
            "locale" : "en-us",
            "code" : "BenjaminRUS"
            };        
        case "Jessa24KRUS":
            return {
                "gender" : "female",
                "locale" : "en-us",
                "code" : "Jessa24KRUS"
            } ;
        default:
            return {
                "gender" : "female",
                "locale" : "en-us",
                "code" : "Jessa24KRUS"
            } ;
    }
/*
    if (!voice || (voice.gender === "female")){
        return {
            "gender" : "female",
            "locale" : "en-us",
            "code" : "Jessa24KRUS"
        }
    } else {
        return {
            "gender" : "male",
            "locale" : "en-us",
            "code" : "BenjaminRUS"
        }
    }
*/

    
}

// Make sure to update User-Agent with the name of your resource.
// You can also change the voice and output formats. See:
// https://docs.microsoft.com/azure/cognitive-services/speech-service/language-support#text-to-speech
const textToSpeech = async (accessToken,  filenameandpath, region,  text, voice)=> {

    try{

        console.log(`filenameandpath=${filenameandpath}`);
        console.log(`region=${region}`);
        console.log(`voice=${JSON.stringify(voice)}`);

        let selectedVoice = getVoice(voice);

        // Create the SSML request.
        let body = `<?xml version="1.0"?><speak version="1.0" xml:lang="en-us"><voice xml:lang="en-us" name="Microsoft Server Speech Text to Speech Voice (${selectedVoice.locale}, ${selectedVoice.code})"><prosody rate="-20.00%">${text}</prosody></voice></speak>`;

        console.log(body);

        let options = {
            "method": "POST",
            "baseUrl": `https://${region}.tts.speech.microsoft.com/`,
            "url": "cognitiveservices/v1",
            "headers": {
                "Authorization": "Bearer " + accessToken,
                "cache-control": "no-cache",
                "User-Agent": "YOUR_RESOURCE_NAME",
                "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
                "Content-Type": "application/ssml+xml"
            },
            body: body
        }
        
        // request has binary audio file
        let request = rp(options)
        .on('response', (response) => {
            if (response.statusCode === 200) {
                request.pipe(fs.createWriteStream(filenameandpath));
                console.log('Your file is ready.')
            } else {
                console.log(response.statusCode);
                console.log(response.statusMessage);
            }
        });
        return request;

    } catch(err){
        console.log(err);
    }
}


// Use async and await to get the token before attempting
// to convert text to speech.
const mp3 = async function(options) {

    let answer = {};
    answer.text = options.text;
    answer.options = options;
    answer.error = [];
    answer.result = {};

    if (!answer.options) {
        answer.error.push('options is empty.');
    } else {
        if (!answer.options.key) {
            answer.error.push('options.key is empty.');
        };
    
        if (!answer.options.region) {
            answer.error.push('options.region is empty.');
        };

        if(!answer.options.id){
            answer.error.push('options.id is empty.');
        }

        if(!answer.options.fileExtension){
            answer.error.push('options.fileExtension is empty.');
        }

        if(!answer.options.path){
            answer.error.push('options.path is empty.');
        } else {
            if ((answer.options.path.indexOf("/")!=-1) && (answer.options.path[answer.options.path.length] != "/")){
                answer.options.path += "/";
            } else if ((answer.options.path.indexOf("\\")!=-1) && (answer.options.path[answer.options.path.length] != "\\")){
                answer.options.path += "\\";
            } else {
                //noop
            }
        }
        // path and file name
        answer.options.path += answer.options.id + answer.options.fileExtension;
        
    };

    if (!answer.text) {
        answer.error.push('text is not set.');
    };

    if (answer.text.length>1000){
        answer.error.push('text is too large (1k char max');
    }

    if(answer.error.length>0){
        answer.result["success"]=false;
        return answer;
    } 

    try {
        // get token
        options.accessToken = await getAccessToken(answer.options.region, answer.options.key);
        console.log("accessToken = " + options.accessToken);

        // get binary - tts
        answer.result["binary"] = await textToSpeech(answer.options.accessToken,answer.options.path,answer.options.region, answer.options.text, answer.options.voice);

        console.log("text file created");
        
        answer.result["success"]=true;
        answer.result["file"]=answer.options.path;
        
        console.log(JSON.stringify(answer.result));
    } catch (err) {
        console.log(`Something went wrong: ${err}`);
        answer.error.push(JSON.stringify(err))
    } finally {
        return answer;
    }
}

module.exports = {
    mp3: mp3
};