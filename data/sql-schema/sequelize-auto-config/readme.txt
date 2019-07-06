Use sequelize-auto-config to create models needed by sequelize to connect to DB. Any time the DB schema changes, these files need to be recreated.

Sequelize uses tedious to connect to MSSQL objects.

https://github.com/sequelize/sequelize-auto
http://tediousjs.github.io


From Sql db or Azure sql, you need:

resource name
database name
user
password
table(s) name

Use commandline from each console statement to generate model files to use in node.js project.

sequelize-auto-config.json passes in as the tedious library's config settings which requires encrypt set to true.

https://medium.com/mtholla/integrating-sequelize-into-your-node-app-a446353fb5ee

