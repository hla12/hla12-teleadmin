const dbConfig = require("../config/db.config");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./users.model")(sequelize, Sequelize);
db.user_wallets = require("./user_wallets.model")(sequelize, Sequelize);
db.transactions = require("./transactions.model")(sequelize, Sequelize);
db.demo_users = require("./demo_users.model")(sequelize, Sequelize);

db.users.hasMany(db.user_wallets, { foreignKey: 'userId' });
db.user_wallets.belongsTo(db.users, { foreignKey: 'userId' });

db.users.hasMany(db.transactions, { foreignKey: 'userId' });
db.transactions.belongsTo(db.users, { foreignKey: 'userId' });

db.users.hasMany(db.demo_users, { foreignKey: 'userId' });
db.demo_users.belongsTo(db.users, { foreignKey: 'userId' });

module.exports = db;