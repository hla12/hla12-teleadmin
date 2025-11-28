module.exports = (sequelize, Sequelize) => {
  const Transaction = sequelize.define("transaction", {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    reference_id: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    type: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    amount: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    status: {
      type: Sequelize.STRING(255),
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
    additional_info: {
      type: Sequelize.JSON,
      allowNull: true
    },
    reference_type: {
      type: Sequelize.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        unique: true,
        fields: ['reference_id', 'type']
      }
    ]
  });

  return Transaction;
};