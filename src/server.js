const express = require('express'),
  fileUpload = require('express-fileupload');
  compress = require('compression'),
  path = require("path"),
  cors = require('cors'),
  winston = require('winston'),
  timeout = require('connect-timeout'),
  expressWinston = require('express-winston');


const configMiddleware = require('./config.js');
const routesMiddleware = require('./routes.js');

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
  app.use(timeout(900000));
  app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: path.join(app.config.rootDir, '/tmp/')
  }));
  app.use(errorHandler);

}

const get = (config) => {

  try {

    const app = express();

    setupApp(app, config);
    routesMiddleware.setupRoutes(app);

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