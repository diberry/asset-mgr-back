const Sequelize = require('sequelize');
//const Files = Sequelize.import("./Files.js");
//const Users = Sequelize.import("./Users.js");



'use strict';


module.exports = class Database {

    constructor(){
        console.log("constructor called");
    }

    doSomething(){
        console.log("do something");
    }

    /*constructor(hostname, dbname, username, password, ) {
        this.sequelize = new Sequelize('diberry-cogserv-app', 'Sql', 'Redrum1!', {
            host: 'diberry-personal.database.windows.net',
            dialect: 'mssql',
            pool: {
              max: 5,
              min: 0,
              acquire: 30000,
              idle: 10000
            },
            dialectOptions: { options: { encrypt: true } }
          });
    }*/

    /*async testConnection(){
        return await this.sequelize.authenticate();
    }*/
}
