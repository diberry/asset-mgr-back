/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('users', {
		userId: {
			type: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
			field: 'UserId'
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
			field: 'DateCreated'
		},
		dateLastAccessed: {
			type: DataTypes.DATE,
			allowNull: false,
			field: 'DateLastAccessed'
		}
	}, {
		tableName: 'Users'
	});
};
