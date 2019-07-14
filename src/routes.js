const path = require("path");

let jwt = require('jsonwebtoken');

const textMiddleware = require('./text.js');
const voices = require('./voices.js');
const authClientRequest = require("./auth");

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

    app.get('/', getRoot);
    app.get('/status', getStatus);
    app.get('/config', getConfig);
    app.get('/config/speech', getConfigSpeech);
    app.get('/error', getError);
    app.get(`/download/:id`, getDownloadMp3);
    app.post('/mp3', postMp3);
    app.post('/upload', postUploadTextFile);
    app.post('/json-array', postJsonArray);
    app.post('/tsv', postTsv);
    app.post('/login', login);
    app.get('/profile', authClientRequest.verifyClientToken, profile);


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
    return res.send('Text to speech');
}
const login = async (req, res, next) => {
  
    authClientRequest.createClientToken(req,res,next);
    //const authentication = new Authentication(req.app.config);
/*
    let username = req.body.username;
    let password = req.body.password;
    // For the given username fetch user from DB
    let mockedUsername = 'admin';
    let mockedPassword = 'password';

    let status=null;
    let body=null;

    let user = {
        id: 1,
        username: username,
        firstName: "dina",
        lastName: "berry",
        email: "dinaberry@outlook.com"
    }

    if (username && password) {
      if (username === mockedUsername && password === mockedPassword) {
        let token = jwt.sign(user,
            req.app.config.secret,
          { //expiresIn: '24h' // expires in 24 hours
            //expiresIn: 60 // expires in 1 minute
            expiresIn: (60 * 10) // expires in 5 minutes
          }
        );
        // return the JWT token for the future API calls
        body = {
          success: true,
          message: 'Authentication successful!',
          token: token
        };
      } else {
        status=403;
        body={
          success: false,
          message: 'Incorrect username or password'
        };
      }
    } else {
      status=400;
      body={
        success: false,
        message: 'Authentication failed! Please check the request'
      };
    }

    if (!status){
        status = 200;
    }

    res.status = status;
    res.json(body);*/
}
const profile = async (req, res, next) => {
    console.log("profile");
    return res.status(200).send({"status":profile});
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
const postUploadTextFile = async (req, res, next) => {



    if (!req.app.config) throw "upload route - app not configured";
    let answer = textMiddleware.createResponseObject(req.app.config);

    if (!req.files || (Object.keys(req.files).length == 0) || !req.files.fileToConvert) {

        answer.route = "upload";
        answer.statusCode = 400,
            answer.error = "empty params";
        return res.status(answer.statusCode).send(answer);
    }

    let file = req.files.fileToConvert;

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