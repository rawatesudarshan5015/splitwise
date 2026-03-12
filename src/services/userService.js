const { User } = require('../models');
const { Op } = require('sequelize');

// Helper function to create custom errors
const createError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createUser = async ({ email, password, default_currency }) => {
  // Check if email already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw createError("Email already in use", 400);
  }

  // Create new user (password hashing is handled by User model hooks)
  const user = await User.create({ email, password, default_currency });

  // Return user without password
  const { password: _, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};

const getUserById = async (id) => {
  // Find user by id
  const user = await User.findByPk(id);
  
  if (!user) {
    throw createError("User not found", 404);
  }

  // Return user without password
  const { password, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};

const updateUser = async (id, { email, default_currency }) => {
  // Find user by id
  const user = await User.findByPk(id);
  
  if (!user) {
    throw createError("User not found", 404);
  }

  // If new email provided, check if it's taken by another user
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ 
      where: { 
        email, 
        id: { [Op.ne]: id } 
      } 
    });
    
    if (existingUser) {
      throw createError("Email already in use", 400);
    }
  }

  // Update provided fields
  if (email !== undefined) user.email = email;
  if (default_currency !== undefined) user.default_currency = default_currency;

  await user.save();

  // Return updated user without password
  const { password, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};

const deleteUser = async (id) => {
  // Find user by id
  const user = await User.findByPk(id);
  
  if (!user) {
    throw createError("User not found", 404);
  }

  // Delete user
  await user.destroy();

  return { message: "User deleted successfully" };
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser
};
