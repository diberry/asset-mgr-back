# Cognitive Asset manager - backend
Manage assets and models built from assets for Cognitive Services

Project # 82038

## Getting started

1. Fork and clone project
1. Copy `env.sample` and rename to `.env`. 
1. Create Azure resources
    1. Speech
    1. Translator
    1. Storage
1. Fill in values in `.env`:

    |Variable|Purpose|
    |--|--|
    |SPEECHRESOURCETOKENHOST|`westus.api.cognitive.microsoft.com` - Token server. TBD - fix when fixing custom endpoints across Cognitive Services.
    |SPEECHRESOURCETTSHOST|`westus.tts.speech.microsoft.com` - TBD - fix when fixing custom endpoints across Cognitive Services.|
    |SPEECHKEY|Cognitive Services Speech key|
    |DFBAPISERVERVER|`0.1` - versioning of node.js server app|
    |DFBAPISERVERPORT|`3005` - Local node.js server port.|
    |DFBAPIUPLOADSERVERDIR|`upload` - Local directory where files are uploaded to.|
    |DFBAPIDOWNLOADSERVERDIR|`out` - Local directory to store downloadable files. TBD - Move to Azure files. |
    |DFBAPIDOWNLOADSERVERURI|`localhost` - Host used for download URIs.|
    |DFBAPIDOWNLOADSERVERPORT|`3010` - Port used for download URIs. Create MP3 from text then return download URI.|
    |TRANSLATORKEY|Cognitive Services Translator key, currently hardcoded to westus region.|
    |AZSTORAGECONNECTIONSTRING|Azure storage connection string|
    |AZSTORAGECONTAINER|`containercogservblob` Your custom name for container in Azure Storage|
    |SECRET|String used to create user authentication token|

1. `npm start` to run server or `npm test` to run Jest tests. 
1. [Deploy to Azure web app](https://docs.microsoft.com/en-us/azure/app-service/deploy-local-git) from local Git