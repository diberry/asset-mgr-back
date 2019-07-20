const User = require("../../src/user.js"),
    config = require("../../src/config.js");

const testConfig = config.getConfigTest();
const user = "user2";
const password = "user2";

const userMgr = new User(testConfig);

// create user
userMgr.create(user, password).then((response) => {
    return userMgr.get(response.user);
}).then(user => {
    console.log(user);
}).catch((err)=>{
    console.log(err);
});
