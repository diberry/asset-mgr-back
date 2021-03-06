const Sequelize = require("sequelize");
const { User }  = require("./Users.js.js");
const { File } = require("./Files.js.js");

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
            }, 
            timestamps: false
          });

        this.models = {
            User: User.init(this.sequelize, Sequelize),
            File: File.init(this.sequelize, Sequelize)
        };

        /*
        // Run `.associate` if it exists,
        // ie create relationships in the ORM
        Object.values(models)
        .filter(model => typeof model.associate === "function")
        .forEach(model => model.associate(models));
        
        */
       /*
       this.models.User.hasMany(File, {});
       this.models.File.belongsTo(User, {
            onDelete: 'cascade',
            foreignKey: {
                field: 'userId',
                allowNull: false,
              }
       });
       */
    }

    async testConnection(){
        return await this.sequelize.authenticate();
    }
}
