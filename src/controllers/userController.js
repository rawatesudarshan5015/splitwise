const userService = require('../services/userService');

const createUser = async (req, res) => {
  const { email, password, default_currency } = req.body;
  const result = await userService.createUser({ email, password, default_currency });
  res.status(201).json({ success: true, data: result });
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  const result = await userService.getUserById(id);
  res.status(200).json({ success: true, data: result });
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, default_currency } = req.body;
  const result = await userService.updateUser(id, { email, default_currency });
  res.status(200).json({ success: true, data: result });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const result = await userService.deleteUser(id);
  res.status(200).json({ success: true, data: result });
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser
};
