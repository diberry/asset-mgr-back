const Sequelize = require('sequelize');
//const Files = Sequelize.import("./Files.js");
//const Users = Sequelize.import("./Users.js");
'use strict';


module.exports = class Database {

    constructor(host, catalog, user, pwd){
        this.sequelize = new Sequelize(catalog, user, pwd, {
            host: host,
            dialect: 'mssql',
            pool: {
              max: 5,
              min: 0,
              acquire: 30000,
              idle: 10000
            },
            dialectOptions: { 
                options: { 
                    encrypt: true 
                } 
            }
          });
    }

    async testConnection(){
        return await this.sequelize.authenticate();
    }
}
