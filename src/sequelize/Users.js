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
					type: "NCHAR",
					allowNull: false,
					field: 'Email'
				},
				name: {
					type: "NCHAR",
					allowNull: false,
					field: 'Name'
				},
				dateCreated: {
					type: DataTypes.DATE,
					allowNull: false,
					defaultValue: '(getdate())',
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
	  static getId(where) {
		return this.findOne({
		  where,
		  attributes: ["id"],
		  order: [["createdAt", "DESC"]]
		});
	  }	
	  getName() {
		return `${this.name}`;
	  }	    
  }

  module.exports = {
	  User: User
  }