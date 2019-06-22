// require modules
var files = require('./files.js');
var archiver = require('archiver-promise');

// Creates a zip of files
const createZip = async (zipNameAndLocationWithFullPath, filesArrayWithFullPath) => {
    try{
        

        if(!zipNameAndLocationWithFullPath || !filesArrayWithFullPath || filesArrayWithFullPath.length==0) throw ("params are empty");

        var archive = archiver(zipNameAndLocationWithFullPath,{
            store: true,
            zlib: { level: 9 }
            // more options https://archiverjs.com/docs/
          });


        // append a file from stream
        for (const item of filesArrayWithFullPath) {
            let fileStream = await files.createReadStream(item.fullLocation);
            archive.append(fileStream, { name: item.name });
        }

        await archive.finalize();

        return;

    } catch(err){
        throw err;
    }

}

module.exports = {
    createZip: createZip
};