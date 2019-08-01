# Cognitive Asset manager - backend - Project 82038
Manage assets and models built from assets for Cognitive Services

## Post-hackathon update
This project has been separated out into a streaming upload server and triggered Azure functions. The streaming server has been moved to a separate [repo](https://github.com/diberry/upload-file-server.git). 

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
1. [Deploy to Azure web app](https://docs.microsoft.com/en-us/azure/app-service/deploy-local-git) from local Git. [Instructions](https://docs.microsoft.com/en-us/azure/app-service/containers/quickstart-nodejs) to redeploy from CLI.

[Main URL](http://asset-mgr-main.azurewebsites.net/)

## Deploy to Azure

Following [instructions](https://docs.microsoft.com/en-us/azure/app-service/deploy-local-git?toc=%2Fazure%2Fapp-service%2Fcontainers%2Ftoc.json#get-the-deployment-url). 

### Create user

Do this once, at the beginning, for each local computer you develop with.

1. Create user for local git:

    ```
    az webapp deployment source config-local-git --name <app-name> --resource-group <group-name>
    ```

1. Get credentials

    ```
    az webapp deployment list-publishing-credentials --name <app-name> --resource-group <group-name> --query scmUri --output tsv
    ```

1. Use URL from response, create remote link for git

    ```
    git remote add azure <url>
    ```

### Deploy project to azure via local Git command

1. [Deploy](https://docs.microsoft.com/en-us/azure/app-service/deploy-local-git?toc=%2Fazure%2Fapp-service%2Fcontainers%2Ftoc.json#deploy-the-web-app) to azure.

    ```
    git push azure master
    ```

