const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const asyncWrapper = require('../middleware/asyncWrapper');

router.get('/balances/:userId', asyncWrapper(balanceController.getUserBalances));

module.exports = router;
