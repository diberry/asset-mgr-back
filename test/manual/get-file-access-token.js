    const azure = require('azure-storage');

    try{
      const connectionString = "";
      const share = "";
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