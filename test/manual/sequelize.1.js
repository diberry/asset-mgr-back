const Sequelize = require('sequelize');
//works
const sequelize = new Sequelize('diberry-cogserv-app', 'Sql', 'Redrum1!', {
    host: 'diberry-personal.database.windows.net',
    dialect: 'mssql',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
    dialectOptions: { options: { encrypt: true } }
  });


  class User extends Sequelize.Model {}
  User.init({
    UserId: Sequelize.UUID,
    Email: Sequelize.STRING,
    Name: Sequelize.STRING,
    DateCreated: Sequelize.DATE,
    DateLastAccessed: Sequelize.DATE
  }, { sequelize, modelName: 'Users', timestamps: false });
  
  sequelize.sync()
    .then(() => User.create({
      name: 'janedoe'  }))
    .then(result => {
      console.log(result.toJSON());
    });