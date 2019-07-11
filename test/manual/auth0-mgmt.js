var request = require("request");
var email = "diberry@microsoft.com";

var options = { method: 'POST',
  url: 'https://dev-646dx0j7.auth0.com/oauth/token',
  headers: { 'content-type': 'application/json' },
  body: '{"client_id":"","client_secret":"","audience":"https://dev-646dx0j7.auth0.com/api/v2/","grant_type":"client_credentials"}' };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  const access_token = JSON.parse(body).access_token;

  var options = { method: 'GET',
  url: 'https://dev-646dx0j7.auth0.com/api/v2/stats/active-users',
  headers: { authorization: `Bearer ${access_token} `} };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    var options = { method: 'GET',
    url: `https://dev-646dx0j7.auth0.com/api/v2/users-by-email?email=${email}`,
    headers: { authorization: `Bearer ${access_token} `} };
  
      request(options, function (error, response, body) {
      if (error) throw new Error(error);
  
      console.log(body);
      });
    });
});