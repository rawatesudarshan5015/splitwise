const { Expense, ExpenseMember, User, sequelize } = require('../models/index');
const balanceService = require('./balanceService');
const { Op } = require('sequelize');

const createError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createExpense = async ({ name, value, currency, date, created_by, members }) => {
  if (!members || members.length === 0) {
    throw createError("Members array is empty or missing", 400);
  }
  
  if (!members.includes(created_by)) {
    throw createError("created_by is not in members array", 400);
  }

  for (const userId of members) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw createError(`User with id ${userId} not found`, 400);
    }
  }

  return await sequelize.transaction(async (t) => {
    const shareAmount = parseFloat((value / members.length).toFixed(2));
    
    const expense = await Expense.create({
      name,
      value,
      currency,
      date,
      created_by
    }, { transaction: t });

    for (const userId of members) {
      await ExpenseMember.create({
        expense_id: expense.id,
        user_id: userId,
        share_amount: shareAmount
      }, { transaction: t });
    }

    await balanceService.updateBalancesOnAdd(created_by, members, shareAmount, currency, t);

    return await Expense.findByPk(expense.id, {
      include: [{ model: ExpenseMember, as: "members" }],
      transaction: t
    });
  });
};

const getExpenseById = async (id) => {
  const expense = await Expense.findByPk(id, {
    include: [
      { model: User, as: "creator", attributes: ['id', 'email'] },
      { 
        model: ExpenseMember, as: "members",
        include: [{ model: User, as: "user", attributes: ['id', 'email'] }]
      }
    ]
  });

  if (!expense) {
    throw createError("Expense not found", 404);
  }

  return expense;
};

const updateExpense = async (id, { name, value, currency, date, members }) => {
  return await sequelize.transaction(async (t) => {
    const expense = await Expense.findByPk(id, {
      include: [{ model: ExpenseMember, as: "members" }],
      transaction: t
    });

    if (!expense) {
      throw createError("Expense not found", 404);
    }

    const oldMemberIds = expense.members.map(m => m.user_id);
    const oldShareAmount = parseFloat((expense.value / oldMemberIds.length).toFixed(2));

    await balanceService.updateBalancesOnDelete(
      expense.created_by, oldMemberIds, oldShareAmount, expense.currency, t
    );

    await ExpenseMember.destroy({ 
      where: { expense_id: id }, 
      transaction: t 
    });

    if (name) expense.name = name;
    if (value) expense.value = value;
    if (currency) expense.currency = currency;
    if (date) expense.date = date;
    
    await expense.save({ transaction: t });

    const newShareAmount = parseFloat((expense.value / members.length).toFixed(2));

    for (const userId of members) {
      await ExpenseMember.create({
        expense_id: expense.id,
        user_id: userId,
        share_amount: newShareAmount
      }, { transaction: t });
    }

    await balanceService.updateBalancesOnAdd(
      expense.created_by, members, newShareAmount, expense.currency, t
    );

    return await Expense.findByPk(expense.id, {
      include: [{ model: ExpenseMember, as: "members" }],
      transaction: t
    });
  });
};

const deleteExpense = async (id) => {
  return await sequelize.transaction(async (t) => {
    const expense = await Expense.findByPk(id, {
      include: [{ model: ExpenseMember, as: "members" }],
      transaction: t
    });

    if (!expense) {
      throw createError("Expense not found", 404);
    }

    const memberIds = expense.members.map(m => m.user_id);
    const shareAmount = parseFloat((expense.value / memberIds.length).toFixed(2));

    await balanceService.updateBalancesOnDelete(
      expense.created_by, memberIds, shareAmount, expense.currency, t
    );

    await ExpenseMember.destroy({ 
      where: { expense_id: id }, 
      transaction: t 
    });

    await expense.destroy({ transaction: t });

    return { message: "Expense deleted successfully" };
  });
};

const getActivityLog = async (userId, { filter, startDate, endDate }) => {
  const now = new Date();
  let start, end;

  if (filter === "this_month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  } else if (filter === "last_month") {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  } else if (filter === "custom") {
    start = new Date(startDate);
    end = new Date(endDate);
    
    // Set 'end' to the end of the day for inclusivity
    end.setHours(23, 59, 59, 999);
  } else {
    // Default fallback to "this_month" if missing or invalid
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  // 1. Find all expense IDs where userId is a participant
  const memberships = await ExpenseMember.findAll({
    where: { user_id: userId },
    attributes: ['expense_id']
  });

  const expenseIds = memberships.map(m => m.expense_id);

  // 2. Fetch all expenses matching the IDs and the date range
  const expenses = await Expense.findAll({
    where: {
      id: { [Op.in]: expenseIds },
      date: { [Op.between]: [start, end] }
    },
    include: [
      { model: User, as: "creator", attributes: ['id', 'email'] },
      { 
        model: ExpenseMember, as: "members",
        include: [{ model: User, as: "user", attributes: ['id', 'email'] }]
      }
    ],
    order: [['date', 'DESC']]
  });

  // 3. Group by month name and year (e.g., "March 2026")
  const groupedLog = {};
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  for (const exp of expenses) {
    const d = new Date(exp.date);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    
    if (!groupedLog[key]) {
      groupedLog[key] = [];
    }
    groupedLog[key].push(exp);
  }

  return groupedLog;
};

module.exports = {
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getActivityLog
};
