const tts = require('./tts.js'),
    fs = require("fs").promises;

const processText = async (options) =>{
    let fileProcessed = await tts.mp3(options);
}
const saveTextToFile = async(rootDir, id, file)=>{

    try{
        let uploadPath = path.join(rootDir, `/uploads/${id}-${file.name}`);
    
        await file.mv(uploadPath);

        let fileText = await fs.readFile(uploadPath, "utf-8");
        if(!fileText || fileText.length ===0){
            answer.read = {
            status:"failed",
            message: "empty file"
            }
        }

        return fileText;

    } catch (err){
        console.log("saveTextToFile failed");
        throw err;
    }

}

module.exports = {
    processText: processText,
    saveTextToFile: saveTextToFile
};