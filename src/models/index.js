const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./user');
const Expense = require('./expense');
const ExpenseMember = require('./expenseMember');
const Balance = require('./balance');

// 1. User Associations
User.hasMany(Expense, { foreignKey: "created_by", as: "createdExpenses" });
User.hasMany(ExpenseMember, { foreignKey: "user_id", as: "expenseMemberships" });
User.hasMany(Balance, { foreignKey: "user_id", as: "debts" });
User.hasMany(Balance, { foreignKey: "owes_user_id", as: "credits" });

// 2. Expense Associations
Expense.belongsTo(User, { foreignKey: "created_by", as: "creator" });
Expense.hasMany(ExpenseMember, { foreignKey: "expense_id", as: "members" });

// 3. ExpenseMember Associations
ExpenseMember.belongsTo(Expense, { foreignKey: "expense_id", as: "expense" });
ExpenseMember.belongsTo(User, { foreignKey: "user_id", as: "user" });

// 4. Balance Associations
Balance.belongsTo(User, { foreignKey: "user_id", as: "debtor" });
Balance.belongsTo(User, { foreignKey: "owes_user_id", as: "creditor" });

// Database Synchronization
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("All tables synced successfully");
  } catch (error) {
    console.error("Failed to sync database:", error);
  }
};

module.exports = {
  User,
  Expense,
  ExpenseMember,
  Balance,
  syncDatabase,
  sequelize,
  Sequelize
};
