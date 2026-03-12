const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const asyncWrapper = require('../middleware/asyncWrapper');

router.post('/users', asyncWrapper(userController.createUser));
router.get('/users/:id', asyncWrapper(userController.getUserById));
router.put('/users/:id', asyncWrapper(userController.updateUser));
router.delete('/users/:id', asyncWrapper(userController.deleteUser));

module.exports = router;
