const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const asyncWrapper = require('../middleware/asyncWrapper');

// IMPORTANT: /activity must come before /:id
router.get('/expenses/activity', asyncWrapper(expenseController.getActivityLog));

router.post('/expenses', asyncWrapper(expenseController.createExpense));
router.get('/expenses/:id', asyncWrapper(expenseController.getExpenseById));
router.put('/expenses/:id', asyncWrapper(expenseController.updateExpense));
router.delete('/expenses/:id', asyncWrapper(expenseController.deleteExpense));

module.exports = router;
