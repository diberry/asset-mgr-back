//const path = require("path");

//let jwt = require('jsonwebtoken');
const authenticatedRoutes = require('./routes-authenticated-user.js');

const textMiddleware = require('./text.js');
const voices = require('./voices.js');
const authClientRequest = require("./auth.js");
const User = require('./user.js');

const setupRouterLogger = (app) => {
    app.use(expressWinston.logger(app.config.logger.routerLogger.winston));
}
const setupPipelineLogger = (app) => {
    app.use(expressWinston.errorLogger(app.config.logger.pipeLineLogger.winston));
}

const setupRoutes = (app) => {

    if (app.config.logger.routerLogger) setupRouterLogger(app);

    // allow all headers through for preflight CORS
    app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.header('Access-Control-Allow-Headers', '*');
        if ('OPTIONS' == req.method) {
            res.sendStatus(200);
        } else {
            next();
        }
    });

    // user
    app.post('/user/create', userCreate);
    app.post('/login', login);
    app.get('/profile', authClientRequest.verifyClientToken, profile);
    app.post('/user/auth-test',authClientRequest.verifyClientToken,getUserAuthTest);
    app.post('/user/delete', authClientRequest.verifyClientToken, authenticatedRoutes.deleteUser);

    // system    
    app.get('/status', getStatus);
    app.get('/config', getConfig);
    app.get('/config/speech', getConfigSpeech);
    app.get('/error', getError);

    // services
    app.get(`/download/:id`, getDownloadMp3);
    app.post('/mp3', postMp3);
    app.post('/json-array', postJsonArray);
    app.post('/tsv', postTsv);

    // services - require authentication
    //app.post('/upload', postUploadTextFile);
    app.post('/upload', authenticatedRoutes.uploadFiles);
    app.post('/uploadFiles', /*authClientRequest.verifyClientToken, */authenticatedRoutes.uploadFiles);
    app.get('/user/share', authClientRequest.verifyClientToken,authenticatedRoutes.getShare);

    // root
    app.get('/', getRoot);

    // development error handler
    // stacktraces leaked to user
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            if(err.message == "Not Found" || err.statusCode == 404){
                 return res.status(404).send("file not found");
            } else if (err.name === 'UnauthorizedError'){
                // failed authentication on routes that require it
                res.status(401).send('invalid token : ' + err);
                  
            } else {
                res.status(err.statusCode || 500).send(err);
            }
        });
    }
    
    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        if(err.message == "Not Found" || err.statusCode == 404){
            return res.status(404).send("file not found");
        } else if (err.name === 'UnauthorizedError'){
            // failed authentication on routes that require it
            res.status(401).send('invalid token'); 
        } else {
        res.status(500).send('Something broke!');
       }        
    });

    setupPipelineLogger(app);

}
const getError = (req, res, next) => {
    next(new Error("This is an error and it should be logged to the console"));
}
const getRoot = (req, res) => {
    return res.send('Asset Mgr - back ' + req.app.config.port + "<br>Contact: diberry");
}
const userCreate = async (req, res, next) => {

    let username = req.body.username;
    let password = req.body.password;

    if(!username || !password){
        res.status(400).send("Missing required information");
    }

    let user = new User(req.app.config);
    let createdUser = await user.create(username,password);

    if(createdUser && createdUser.user){
        res.status(200).json({"success":true});
    }

    next();
}
const login = async (req, res, next) => {
  
    let username = req.body.username;
    let password = req.body.password;

    if(!username || !password){
        res.status(400).send("Missing required information");
    }

    let user = new User(req.app.config);
    let loggedInUser = await user.login(username,password);

    if(loggedInUser && loggedInUser.user && loggedInUser.token){
        
        res.status(200).json({"success":true, token:loggedInUser.token});

    } else {

        res.status(401).send("Authentication denied");
    }

    next();
}
const profile = async (req, res, next) => {
    console.log("profile");
    return res.status(200).send({"status":profile});
}
const getUserAuthTest = async(req, res, next)=>{
    res.status(200).send({"status":"authenticated " + req.user});
    next();
}
const getStatus = async (req, res, next) => {
    let answer = textMiddleware.createResponseObject(req.app.config);
    answer.route = "/status";
    answer.status = "running";
    return res.status(200).send(answer);
}
const getConfig = async (req, res, next) => {
    let answer = textMiddleware.createResponseObject(req.app.config);
    answer.route = "/config";
    answer["config"] = {
        "voices": voices
    };
    return res.status(200).send(answer);
}
const getConfigSpeech = async (req, res, next) => {
    let answer = textMiddleware.createResponseObject(req.app.config);
    answer.route = "/config/speech";
    answer["config"] = {
        "voices": voices
    };
    return res.status(200).send(answer);
}
const getDownloadMp3 = (req, res, next) => {

    console.log(JSON.stringify(req.headers));

    return res.download(`${req.app.config.download.dir}/${req.params.id}`);
}
const postMp3 = async (req, res, next) => {

    if (!req.app.config) throw "mp3 route - app not configured";

    if (!req || !req.body || !req.body.rawtext || req.body.rawtext.length === 0) {
        let answer = textMiddleware.createResponseObject(req.app.config);
        answer.route = "mp3";
        answer.statusCode = 400,
        answer.error = "empty params";
        return res.status(answer.statusCode).send(answer);
    }

    let config = req.app.config;
    config.body = req.body;
    config.route = "mp3";
    config.body.text = config.body.rawtext;

    let answer = await textMiddleware.createAudioFile(config);

    return res.status(answer.statusCode).send(answer);
}
/** 
 * 1. Upload file
 * 2. Read post Body to figure out what to do with file:
 *    a. if no auth token - convert to mp3 and return download URL
 *    b. if auth token 
 *       i. authentication token
 *       ii. body properties: ["cognitive-service","subservice","appName"]
*/

const postUploadTextFile = async (req, res, next) => {


    
    if (!req.app.config) throw "upload route - app not configured";
    let answer = textMiddleware.createResponseObject(req.app.config);

    // protype - files is actually 1 file
    if (!req.files || (Object.keys(req.files).length == 0) || !req.files) {

        answer.route = "upload";
        answer.statusCode = 400,
            answer.error = "empty params";
        return res.status(answer.statusCode).send(answer);
    }

    // prototype - take first file only
    let file = req.files.files;

    let config = req.app.config;
    config.answer = answer;
    config.route = "upload";
    config.body = req.body;
    config.body.file = file;
    config.body.text = await textMiddleware.saveFileAndReadFile(config.rootDir,  config.upload.processingDir, config.answer.id, config.body.file);
    let result = await textMiddleware.createAudioFile(config);

    return res.status(result.statusCode).send(result);


}
const postJsonArray = async (req, res, next) => {

    if (!req || !req.body || !req.body["json-array"] || req.body["json-array"].constructor.name != "Array") {
        let answer = textMiddleware.createResponseObject(req.app.config);
        answer.route = "json-array";
        answer.statusCode = 400,
            answer.error = "empty params";
        return res.status(answer.statusCode).send(answer);
    }

    let config = req.app.config;
    config.body = req.body;
    config.route = "json-array";
    let answer = await textMiddleware.processManyRequestsFromJson(config);

    return res.status(answer.statusCode).send(answer);

}
const postTsv = async (req, res, next) => {

    if (!req.files || (Object.keys(req.files).length == 0) || !req.files.fileToConvert) {
        let answer = textMiddleware.createResponseObject(req.app.config);
        answer.route = "tsv";
        answer.statusCode = 400,
            answer.error = "empty params";
        return res.status(answer.statusCode).send(answer);
    }


    let file = req.files.fileToConvert;

    let config = req.app.config;
    config.body = req.body;
    config.body.file = file;
    config.route = "tsv";

    let answer = await textMiddleware.processManyRequestsFromTsvFile(config);

    return res.status(answer.statusCode).send(answer);

};

module.exports = {
    setupRoutes: setupRoutes
};