const express = require('express'),
  fs = require("fs").promises,
  fileUpload = require('express-fileupload');
  compress = require('compression'),
  path = require("path"),
  cors = require('cors'),
  crypto = require("crypto"),
  winston = require('winston'),
  expressWinston = require('express-winston')
  ;

require('dotenv').config();


const textMiddleware = require('./text.js');

const setupRouterLogger = (app, config) => {
  app.use(expressWinston.logger(config.logger.routerLogger.winston));
}
const setupPipelineLogger = (app, config) => {
  app.use(expressWinston.errorLogger(config.logger.pipeLineLogger.winston));  
}

function errorHandler (err, req, res, next) {
  res.status(500)
  res.render('error', { error: err })
}
const checkConfig = (config) => {

  if(!config ) throw ("config is empty");
  if(!config.port && (typeof config.port == 'number')) throw ("config.port is empty");
  if(!config.rootDir && (typeof config.rootDir == 'string')) throw ("config.rootDir is empty");
  if(!config.ver && (typeof config.ver == 'string')) throw ("config.ver is empty");

  if(!config.ttsService && (typeof config.ttsService == 'object')) throw ("config.ttsService is empty");
  if(!config.ttsService.region && (typeof config.ttsService.region == 'string')) throw ("config.ttsService.region is empty");  
  if(!config.ttsService.key && (typeof config.ttsService.key == 'string')) throw ("config.ttsService.key is empty"); 
  
  if(!config.download && (typeof config.download == 'object')) throw ("config.download is empty");  
  if(!config.download.host && (typeof config.download.host == 'string')) throw ("config.download.host is empty");  
  if(!config.download.port && (typeof config.download.port == 'object')) throw ("config.download.port is empty");  
  if(!config.download.dir && (typeof config.download.dir == 'object')) throw ("config.download.dir is empty");  

}

const startAnswer = (config)=>{
  return {
      dateTime: new Date(), 
      id: crypto.randomBytes(16).toString("hex"),
      ver: config.ver,
      status: null
    };
}

const setupApp = (app,config) =>{
  app.use(compress());
  app.use(cors());
  app.use(express.json());
  app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles : true,
    tempFileDir : path.join(config.rootDir,'/tmp/')
  }));
  app.use(errorHandler); 
}
const setupRoutes = (app,config)=>{

  if(config.logger.routerLogger) setupRouterLogger(app,config);

  app.get('/', (req, res) => res.send('Text to speech'));

  app.get('/status', async (req,res, next) =>{
    let answer = startAnswer(config);
    answer.status = "running";
    return res.status(200).send(answer); 
  });

  app.get('/config/speech', async (req,res, next) =>{
    let answer = startAnswer(config);
    answer["config"] = {
      "voices": [
        {locale:"en-us",gender:"female",voice:"Jessa",code:"Jessa24KRUS"},
        {locale:"en-us",gender:"male",voice:"Benjamin",code:"BenjaminRUS"}
    ]};
    return res.status(200).send(answer); 
  });
  app.get('/error', function(req, res, next) {
    return next(new Error("This is an error and it should be logged to the console"));
  });
  
  app.get(`/download/:id`,(req,res, next)=>{
    try{
    console.log("Id =" + req.params.id);
    res.download(path.join(config.rootDir,`${config.download.dir}/${req.params.id}`));
    } catch (err){
      console.log(err);
      // don't show full error
      return res.status(400).send("file not found");
    }
  });
  
  // send text in `rawtext` variable
  app.post('/mp3', async(req, res, next) => {
  
    let answer = startAnswer(config);
  
    try{
      console.log("mp3 top");
      console.log(`req.body = ${JSON.stringify(req.body)}`);
  
      if(!req || !req.body || !req.body.rawtext || req.body.rawtext.length ===0){
        answer = {
          status:"failed",
          message: "empty file"
        }
        console.log("empty body sent");
        return res.status(400).send("empty body sent");
      }
  
      let pathToDownload  = path.join(config.rootDir,config.download.dir);

      let options = {
        id: answer.id,
        text: req.body.rawtext,
        path: pathToDownload,
        key: process.env.SPEECHKEY,
        region: process.env.SPEECHREGION,
        voice: req.body.voice,
        fileExtension: '.mp3'
      };
  
      console.log(JSON.stringify(options));
  
      let fileProcessed = await textMiddleware.processText(options);
      
      answer.status = "success"; 
      answer.downloadURI=`http://${config.download.host}:${config.download.port}/download/${answer.id}.mp3`;
      return res.status(200).send(answer);     
    }  catch (error) {
      console.log(`error = ${JSON.stringify(error)}`);
      answer.globalerror = JSON.stringify(error);
      return res.status(500).send(answer);
    }
  });
  
  // send file in `fileToConvert` variable
  app.post('/upload', async (req, res, next) => {
  
    let answer = startAnswer(config);
  
    try{
  
      if (!req.files || (Object.keys(req.files).length == 0) || !req.files.fileToConvert) {
        answer.errorMessage = 'No files were uploaded.';
        return res.status(400).send(answer);
      }
  
      let file = req.files.fileToConvert;
      console.log(`file name = ${file.name}`);
  
      let fileText = await textMiddleware.saveTextToFile(config.rootDir, answer.id, file);
  
      let options = {
        id: answer.id,
        text: fileText,
        path: path.join(config.rootDir, "./out"),
        key: process.env.SPEECHKEY,
        region: process.env.SPEECHREGION,
        voice: req.body.voice,
        fileExtension: '.mp3'
      };
    
        let fileProcessed = await textMiddleware.processText(options);
    
        console.log(JSON.stringify(options));
        
        answer.status = "success"; 
        answer.downloadURI=`http://${config.download.host}:${config.download.port}/download/${answer.id}.mp3`;
        return res.status(200).send(answer);         
 
    } catch (error) {
      console.log(`error caught ${JSON.stringify(error)}`);
      answer.globalerror = JSON.stringify(error);
      return res.status(500).send(answer);
    }
  });


  setupPipelineLogger(app,config);
  
}
const start = (config) => {

  try{

    checkConfig(config);
    
  

    const app=express();

    setupApp(app,config);
    setupRoutes(app,config);
    


    const server = app.listen(config.port, () => {
      console.log(`Server running on: ${config.port}, root at ${config.rootDir}`);
    });

    return server;

  } catch (err){
    console.log(err);
    throw(err);
  } 
}

module.exports = {
  start
};