require('dotenv').config();
const path = require("path");
const winston = require('winston');

const getConfigTest = () => {

    let fixTestRoot = path.join(__dirname,"../");
    console.log(`fixTestRoot = ${fixTestRoot}`); 

    let my_config = {
        secret: process.env.SECRET,
        port: process.env.DFBAPISERVERPORT,
        rootDir: fixTestRoot,
        ver: process.env.DFBAPISERVERVER,
        download:{
            host: process.env.DFBAPIDOWNLOADSERVERURI,
            port: process.env.DFBAPIDOWNLOADSERVERPORT,
            dir: path.join(fixTestRoot, process.env.DFBAPIDOWNLOADSERVERDIR)
        },
        azstorage:{
            connectionString:process.env.AZSTORAGECONNECTIONSTRING,
            container: process.env.AZSTORAGECONTAINER,
            tables:{
                userAuthentication: "user"
            } 
        },
        azdb:[
            {
                host: process.env.AZDB1HOST,
                catalog: process.env.AZDB1CATALOG,
                user: process.env.AZDB1USER,
                pwd: process.env.AZDB1PWD
            }
        ],
        users: {
            auth0:{
            clientID: process.env.AUTH0CLIENTID,
            domain: process.env.AUTH0DOMAIN,
            algorithms: ['RS256']
            }
          },
        upload: {
            uploadDir: "tmp",
            processingDir: "uploads"
        },
        ttsService: {
            hostToken: process.env.SPEECHRESOURCETOKENHOST,
            hostTTS:process.env.SPEECHRESOURCETTSHOST,
            key: process.env.SPEECHKEY
        },
        translator: {
            key: process.env.TRANSLATORKEY
        },
        body: {
            text: null,
            file: null
        },
        logger: {
            routerLogger:{
                winston: {
                    transports: [
                    new winston.transports.Console()
                    ],
                    format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.json()
                    ),
                    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
                    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
                    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
                    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
                    ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
                    
                }
            },
            pipeLineLogger:{
                winston: {
                    transports: [
                    new winston.transports.Console()
                    ],
                    format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.json()
                    )
                }
            
            }
        }
    };
    let checkedConfig = checkConfig(my_config);
    return checkedConfig;
}

const getConfig = () => {

    //const srcDir = "./";
    const rootDir = "../";


    let fixTestRoot = path.join(__dirname,rootDir);

    console.log(`fixTestRoot = ${fixTestRoot}`); 

    let my_config = {
        secret: process.env.SECRET,
        port: process.env.DFBAPISERVERPORT,
        rootDir: fixTestRoot,
        ver: process.env.DFBAPISERVERVER,
        download:{
            host: process.env.DFBAPIDOWNLOADSERVERURI,
            port: process.env.DFBAPIDOWNLOADSERVERPORT,
            dir: path.join(fixTestRoot, process.env.DFBAPIDOWNLOADSERVERDIR)
        },
        azstorage:{
            connectionString:process.env.AZSTORAGECONNECTIONSTRING,
            container: process.env.AZSTORAGECONTAINER,
            tables:{
                userAuthentication: "user"
            }  
        },  
        azdb:[
            {
                host: process.env.AZDB1HOST,
                catalog: process.env.AZDB1CATALOG,
                user: process.env.AZDB1USER,
                pwd: process.env.AZDB1PWD
            }
        ],    
        users: {
            auth0:{
            clientID: process.env.AUTH0CLIENTID,
            domain: process.env.AUTH0DOMAIN,
            algorithms: ['RS256']
            }
          },                  
        upload: {
            dir: path.join(fixTestRoot, process.env.DFBAPIUPLOADSERVERDIR) 
        },     
        upload: {
            uploadDir: "tmp",
            processingDir: "uploads"
        },           
        ttsService: {
            hostToken: process.env.SPEECHRESOURCETOKENHOST,
            hostTTS:process.env.SPEECHRESOURCETTSHOST,
            key: process.env.SPEECHKEY
        },
        translator: {
            key: process.env.TRANSLATORKEY
        },
        logger: {
            routerLogger:{
                winston: {
                    transports: [
                    new winston.transports.Console()
                    ],
                    format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.json()
                    ),
                    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
                    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
                    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
                    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
                    ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
                    
                }
            },
            pipeLineLogger:{
                winston: {
                    transports: [
                    new winston.transports.Console()
                    ],
                    format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.json()
                    )
                }
            
            }
        }
    };
    let checkedConfig = checkConfig(my_config);
    return checkedConfig;
}
const checkConfig = (config)=>{

    if(!config ) throw ("config is empty");
    if(!config.port && (typeof config.port == 'number')) throw ("config.port is empty");
    if(!config.rootDir && (typeof config.rootDir == 'string')) throw ("config.rootDir is empty");
    if(!config.ver && (typeof config.ver == 'string')) throw ("config.ver is empty");
    
    if(!config.ttsService && (typeof config.ttsService == 'object')) throw ("config.ttsService is empty");
    if(!config.ttsService.host && (typeof config.ttsService.host == 'string')) throw ("config.ttsService.host is empty");  
    if(!config.ttsService.key && (typeof config.ttsService.key == 'string')) throw ("config.ttsService.key is empty"); 
    
    if(!config.download && (typeof config.download == 'object')) throw ("config.download is empty");  
    if(!config.download.host && (typeof config.download.host == 'string')) throw ("config.download.host is empty");  
    if(!config.download.port && (typeof config.download.port == 'object')) throw ("config.download.port is empty");  
    if(!config.download.dir && (typeof config.download.dir == 'object')) throw ("config.download.dir is empty");  
    
    return config;
}

module.exports = {
    getConfig: getConfig,
    getConfigTest:getConfigTest
  };