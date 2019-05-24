const tts = require('./tts.js'),
    fs = require("fs").promises,
    detect = require('detect-csv');

const processText = async (options) => {

    if (isTsv(options.text)) {
        options["knowledgeBaseAnswers"] = parseKnowledgeBaseForAnswers(options);
    }

    let fileProcessed = await tts.mp3(options);
}
const saveTextToFile = async (rootDir, id, file) => {

    try {
        let uploadPath = path.join(rootDir, `/uploads/${id}-${file.name}`);

        await file.mv(uploadPath);

        let fileText = await fs.readFile(uploadPath, "utf-8");
        if (!fileText || fileText.length === 0) {
            answer.read = {
                status: "failed",
                message: "empty file"
            }
        }

        return fileText;

    } catch (err) {
        console.log("saveTextToFile failed");
        throw err;
    }

}
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
        //console.log(formated_datas); // @TODO : remove this
        return formated_datas;
    } catch (err) {
        //console.log(err);
        throw err;
    }
}

module.exports = {
    tsvToJson: tsvToJson,
    processText: processText,
    saveTextToFile: saveTextToFile
};