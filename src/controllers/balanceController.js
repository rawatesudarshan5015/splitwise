const balanceService = require('../services/balanceService');

const getUserBalances = async (req, res) => {
  const { userId } = req.params;
  const result = await balanceService.getUserBalances(userId);
  res.status(200).json({ success: true, data: result });
};

module.exports = {
  getUserBalances
};
