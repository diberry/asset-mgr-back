    const azure = require('azure-storage');

    try{
      const connectionString = "DefaultEndpointsProtocol=https;AccountName=diberryassetmgrtest;AccountKey=kjYv5q78sOmoc5l8XcW9YZwJCi2Z2H/e3Hmh4jvJfmwJN+1s84OqSRfRyZqpOWgf0QUyE4lh3QX+ChYaJGKcXQ==;EndpointSuffix=core.windows.net";
      const share = "067d3c58-1332-4db5-8ed4-7a935fc91002";
      const directory = "this-is-a-test";
      const file = "short_en.mp3";

      var startDate = new Date();
      var expiryDate = new Date(startDate);
      expiryDate.setMinutes(startDate.getMinutes() + 5);
    
      var sharedAccessPolicy = {
        AccessPolicy: {
          Permissions: azure.FileUtilities.SharedAccessPermissions.READ,
          Start: startDate,
          Expiry: expiryDate
        }
      };

      const fileService = new azure.FileService(connectionString);

      console.log("about to generate token");

      const accessToken = fileService.generateSharedAccessSignature(share, directory, file, sharedAccessPolicy);

      console.log(`result ${JSON.stringify(accessToken)}`);

    }catch(err){
      console.log(`result ${JSON.stringify(err)}`);
    }