/* jshint indent: 1 */
const Sequelize = require("sequelize");

class File extends Sequelize.Model {
	static init(sequelize, DataTypes) {
		return super.init(
		{
			fileId: {
				type: DataTypes.UUIDV4,
				allowNull: false,
				primaryKey: true,
				field: 'FileId',
				defaultValue: Sequelize.UUIDV4
			},
			userId: {
				type: DataTypes.UUIDV4,
				allowNull: false,
				references: {
					model: 'Users',
					key: 'UserId'
				},
				field: 'UserId'
			},
			fileContainer: {
				type: DataTypes.STRING,
				allowNull: false,
				field: 'FileContainer'
			},
			fileDirectory: {
				type: DataTypes.STRING,
				allowNull: false,
				field: 'FileDirectory'
			},
			filename: {
				type: DataTypes.STRING,
				allowNull: false,
				field: 'Filename'
			},
			dateCreated: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
				field: 'DateCreated'
			}
		}, {
			tableName: 'Files',
			timestamps: false,
			sequelize
		});
	}
	static getByUserId(userId) {
		return this.findAll({
			where: {
				userId: userId
			}
		  });
	  }	 
};

module.exports = {
	File: File
}
