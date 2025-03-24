/**
 * 用户路由
 */
const express = require('express');
const { getUsers, getUserById, updateUserStatus, changePassword, updateProfile } = require('../controllers/user.controller');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// 获取用户列表（管理员）
router.get('/', isAuthenticated, isAdmin, getUsers);

// 获取单个用户信息（管理员）
router.get('/:id', isAuthenticated, isAdmin, getUserById);

// 更新用户状态（管理员）
router.patch('/:id/status', isAuthenticated, isAdmin, updateUserStatus);

// 修改密码
router.post('/change-password', isAuthenticated, changePassword);

// 更新个人信息
router.put('/profile', isAuthenticated, updateProfile);

module.exports = router; 