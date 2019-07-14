const jwt = require('jsonwebtoken');

const verifyClientToken = async (req,res,next) => {

  const tokenL = req.headers.get('authorization');
  const tokenU = req.headers.get('Authorization');

  const token = tokenL || tokenU;

  const isLoggedIn = token && token.startsWith('Bearer ');
  /*
  

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImZpcnN0TmFtZSI6ImRpbmEiLCJsYXN0TmFtZSI6ImJlcnJ5IiwiZW1haWwiOiJkaW5hYmVycnlAb3V0bG9vay5jb20iLCJpYXQiOjE1NjMwNzY2OTYsImV4cCI6MTU2MzA3NzI5Nn0.Sj6lLSdz9141iCdxajzqyp2R2PCrL1gO51QBzJMtqXM

  */
    if (!token){
        return res.status(401).json({
            "errors" : [{
                "msg" : " No authorization provided"
            }]
        });
    } 
    if (!isLoggedIn){
      return res.status(401).json({
          "errors" : [{
              "msg" : " No authorization token provided"
          }]
      });
  } 
    
    jwt.verify(token, req.app.config.secret, (err,decoded) => {
        if(err){
            return res.status(401).json({
                "errors" : [{
                    "msg" : "Invalid Token"
                }]
            });
        }

        // TBD: find user from decoded token
        console.log(decoded);
        
        return next();
    });
}
const createClientToken = async (req, res, next) => {
  //const authentication = new Authentication(req.app.config);

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
  res.json(body);
}
module.exports = {
  verifyClientToken: verifyClientToken,
  createClientToken: createClientToken
}

