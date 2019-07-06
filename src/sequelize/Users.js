/* jshint indent: 1 */
const Sequelize = require("sequelize");

class User extends Sequelize.Model {
	static init(sequelize, DataTypes) {
		return super.init(
			{
				userId: {
					type: DataTypes.UUIDV4,
					allowNull: false,
					primaryKey: true,
					field: 'UserId',
					defaultValue: Sequelize.UUIDV4
				},
				email: {
					type: DataTypes.STRING,
					allowNull: false,
					field: 'Email'
				},
				name: {
					type: DataTypes.STRING,
					allowNull: false,
					field: 'Name'
				},
				dateCreated: {
					type: DataTypes.DATE,
					allowNull: false,
					field: 'DateCreated',
					defaultValue: Sequelize.NOW
				},
				dateLastAccessed: {
					type: DataTypes.DATE,
					allowNull: false,
					field: 'DateLastAccessed',
					defaultValue: Sequelize.NOW
				}
			}, {
				tableName: 'Users',
				timestamps: false,
				sequelize
			}
		);
	  }
	  static getByEmail(email) {
		return this.findAll({
			where: {
				email: email
			}
		  });
	  }	    
  }

  module.exports = {
	  User: User
  }