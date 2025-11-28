module.exports = (sequelize, Sequelize) => {
  const UserWallet = sequelize.define("user_wallet", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    balance: {
      type: Sequelize.BIGINT,
      defaultValue: 0,
      allowNull: false
    },
    address: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true
    },
    network: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    status: {
      type: Sequelize.STRING(255),
      defaultValue: 'active',
      allowNull: false
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false
    },
    coin: {
      type: Sequelize.BIGINT,
      defaultValue: 0,
      allowNull: false
    }
  }, {
    tableName: 'user_wallets',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  return UserWallet;
};