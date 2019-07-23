const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Token = require('./token.js')

// TBD: replace with MSGraph
// https://github.com/diberry/microsoft-authentication-library-for-js

// TBD: change to different auth route fns array
// https://stackoverflow.com/questions/18700729/how-to-use-the-middleware-to-check-the-authorization-before-entering-each-route

// authGuard
// associated test is on routes
const verifyClientToken = async (req,res,next) => {

  const tokenL = req.headers.authorization;
  const tokenU = req.headers.Authorization;

  let token = tokenL || tokenU;

  console.log(token);

  if (!token){
    return res.status(401).json({
        "errors" : [{
            "msg" : "No authorization provided - empty token param"
        }]
    });
  } 

  if(token.indexOf('Bearer ')== -1) {
    return res.status(401).json({
      "errors" : [{
          "msg" : "No authorization provided - no token decoded"
      }]
    });
  } else {

    token = token.replace('Bearer ',"");

    const tokenMgr = new Token(req.app.config.secret);
    const decodedToken = await tokenMgr.verifyTokenAsync(token);
  
    if (!decodedToken){
        return res.status(401).json({
            "errors" : [{
                "msg" : "No authorization provided - no token decoded"
            }]
        });
    } else if (decodedToken.error){
      return res.status(401).json({
        "errors" : [{
            "msg" : "Authorization provided - " + decodedToken.error
        }]
      });
    } else if (!decodedToken.user || !decodedToken.user.user){
      return res.status(401).json({
          "errors" : [{
              "msg" : "Authorization provided - user can't be determined"
          }]
      });
    } else {
      req.user = decodedToken.user.user;
    }
    
  }

  next();
  return;
}
// called from Login route
// user in table with hash must already exist

/*const createClientToken = async (req, res, next) => {

  let username = req.body.username;
  let password = req.body.password;



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

const hashPassword = async (password)=>{
  bcrypt.hash(password, rounds, (error, hash) => {
    callback(error, hash);
  });
}
*/
module.exports = {
  verifyClientToken: verifyClientToken,
  //createClientToken: createClientToken,
  //hashPassword: hashPassword
}

