const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');

class User extends Sequelize.Model {}
User.init({
  UserId: Sequelize.UUID,
  Email: Sequelize.STRING,
  Name: Sequelize.STRING,
  DateCreated: Sequelize.DATE,
  DateLastAccessed: Sequelize.DATE
}, { sequelize, modelName: 'Users' });

sequelize.sync()
  .then(() => User.create({
    name: 'janedoe'  }))
  .then(result => {
    console.log(result.toJSON());
  });