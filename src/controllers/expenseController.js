const expenseService = require('../services/expenseService');

const createExpense = async (req, res) => {
  const { name, value, currency, date, members } = req.body;
  const created_by = req.body.userId;
  
  const result = await expenseService.createExpense({ 
    name, 
    value, 
    currency, 
    date, 
    created_by, 
    members 
  });
  
  res.status(201).json({ success: true, data: result });
};

const getExpenseById = async (req, res) => {
  const { id } = req.params;
  const result = await expenseService.getExpenseById(id);
  res.status(200).json({ success: true, data: result });
};

const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { name, value, currency, date, members } = req.body;
  
  const result = await expenseService.updateExpense(id, { 
    name, 
    value, 
    currency, 
    date, 
    members 
  });
  
  res.status(200).json({ success: true, data: result });
};

const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const result = await expenseService.deleteExpense(id);
  res.status(200).json({ success: true, data: result });
};

const getActivityLog = async (req, res) => {
  const userId = req.query.userId;
  const filter = req.query.filter || "this_month";
  const { startDate, endDate } = req.query;

  const result = await expenseService.getActivityLog(userId, { filter, startDate, endDate });
  res.status(200).json({ success: true, data: result });
};

module.exports = {
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getActivityLog
};
