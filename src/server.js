const express = require('express'),
  fileUpload = require('express-fileupload');
compress = require('compression'),
  path = require("path"),
  cors = require('cors'),
  winston = require('winston'),
  expressWinston = require('express-winston');

const textMiddleware = require('./text.js');
const configMiddleware = require('./config.js');

const setupRouterLogger = (app) => {
  app.use(expressWinston.logger(app.config.logger.routerLogger.winston));
}
const setupPipelineLogger = (app) => {
  app.use(expressWinston.errorLogger(app.config.logger.pipeLineLogger.winston));
}

function errorHandler(err, req, res, next) {
  res.status(500)
  res.render('error', { error: err })
}




const setupApp = (app, config) => {

  if (config) {
    app.config = config;
  } else {
    app.config = configMiddleware.getConfig();
  }
  app.use(compress());
  app.use(cors());
  app.use(express.json());
  app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: path.join(app.config.rootDir, '/tmp/')
  }));
  app.use(errorHandler);

}
const setupRoutes = (app) => {

  if (app.config.logger.routerLogger) setupRouterLogger(app);

  app.get('/', (req, res) => res.send('Text to speech'));

  app.get('/status', async (req, res, next) => {
    let answer = textMiddleware.createResponseObject(req.app.config);
    answer.route = "/status";
    answer.status = "running";
    return res.status(200).send(answer);
  });

  app.get('/config', async (req, res, next) => {
    let answer = textMiddleware.createResponseObject(req.app.config);
    answer.route = "/config";
    answer["config"] = {
      "voices": [
        { locale: "en-us", gender: "female", voice: "Jessa", code: "Jessa24KRUS" },
        { locale: "en-us", gender: "male", voice: "Benjamin", code: "BenjaminRUS" }
      ]
    };
    return res.status(200).send(answer);
  });

  app.get('/config/speech', async (req, res, next) => {
    let answer = textMiddleware.createResponseObject(req.app.config);
    answer.route = "/config/speech";
    answer["config"] = {
      "voices": [
        { locale: "en-us", gender: "female", voice: "Jessa", code: "Jessa24KRUS" },
        { locale: "en-us", gender: "male", voice: "Benjamin", code: "BenjaminRUS" }
      ]
    };
    return res.status(200).send(answer);
  });
  app.get('/error', function (req, res, next) {
    return next(new Error("This is an error and it should be logged to the console"));
  });

  app.get(`/download/:id`, (req, res, next) => {
    try {
      res.download(path.join(req.app.config.rootDir, `${req.app.config.download.dir}/${req.params.id}`));
    } catch (err) {
      // don't show full error
      return res.status(400).send("file not found");
    }
  });



  // send text in `rawtext` variable
  app.post('/mp3', async (req, res, next) => {

    try {

      if (!req.app.config) throw "mp3 route - app not configured";

      if (!req || !req.body || !req.body.rawtext || req.body.rawtext.length === 0) {
        let answer = textMiddleware.createResponseObject(req.app.config);
        answer.route = "mp3";
        answer.statusCode= 400,
        answer.error= "empty params";
        return res.status(answer.statusCode).send(answer);
      }

      let config = req.app.config;
      config.body = req.body;
      config.route = "mp3";
      config.body.text = config.body.rawtext;

      let answer = await textMiddleware.createAudioFile(config);

      return res.status(answer.statusCode).send(answer);

    } catch (error) {
      return res.status(500).send(error);
    }
  });

  // send file in `fileToConvert` variable
  app.post('/upload', async (req, res, next) => {

    try {

      if (!req.app.config) throw "upload route - app not configured";
      let answer = textMiddleware.createResponseObject(req.app.config);

      if (!req.files || (Object.keys(req.files).length == 0) || !req.files.fileToConvert) {
        
        answer.route = "upload";
        answer.statusCode= 400,
        answer.error= "empty params";
        return res.status(answer.statusCode).send(answer);
      }

      let file = req.files.fileToConvert;

      let config = req.app.config;
      config.answer = answer;
      config.route = "upload";
      config.body = req.body;
      config.body.file = file;
      config.body.text = await textMiddleware.saveFileAndReadFile(config.rootDir, config.answer.id, config.body.file);
      let result = await textMiddleware.createAudioFile(config);

      return res.status(result.statusCode).send(result);

    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  });

  // send body with `json-array` variable
  app.post('/json-array', async (req, res, next) => {

    try {

      if (!req || !req.body || !req.body["json-array"] || req.body["json-array"].constructor.name != "Array") {
        let answer = textMiddleware.createResponseObject(req.app.config);
        answer.route = "json-array";
        answer.statusCode= 400,
        answer.error= "empty params";
        return res.status(answer.statusCode).send(answer);
      }

      let config = req.app.config;
      config.body = req.body;
      config.route = "json-array";
      let answer = await textMiddleware.processManyRequestsFromJson(config);

      return res.status(answer.statusCode).send(answer);


    } catch (error) {
      return res.status(500).send(error);
    }
  });

  // send file in `fileToConvert` variable
  app.post('/tsv', async (req, res, next) => {

    try {

      if (!req.files || (Object.keys(req.files).length == 0) || !req.files.fileToConvert) {
        let answer = textMiddleware.createResponseObject(req.app.config);
        answer.route = "tsv";
        answer.statusCode= 400,
        answer.error= "empty params";
        return res.status(answer.statusCode).send(answer);
      }


      let file = req.files.fileToConvert;


      let config = req.app.config;
      config.body = req.body;
      config.body.file = file;
      config.route = "tsv";

      let answer = await textMiddleware.processManyRequestsFromTsvFile(config);

      return res.status(answer.statusCode).send(answer);

    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  });


  setupPipelineLogger(app);

}
const get = (config) => {

  try {

    const app = express();

    setupApp(app, config);
    setupRoutes(app);

    return app;

  } catch (err) {
    throw err;
  }
}
const start = (app) => {

  //https://www.codementor.io/knownasilya/testing-express-apis-with-supertest-du107mcv2

  app.listen(app.config.port, () => {
    //console.log(`Server running on: ${app.config.port}, root at ${app.config.rootDir}`);
  });
}

module.exports = {
  get: get,
  start: start
}