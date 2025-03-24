/**
 * 认证路由
 */
const express = require('express');
const { register, login, logout, getCurrentUser } = require('../controllers/auth.controller');
const { registerValidation, loginValidation, validate } = require('../utils/validator');

const router = express.Router();

// 用户注册
router.post('/register', registerValidation, validate, register);

// 用户登录
router.post('/login', loginValidation, validate, login);

// 退出登录
router.post('/logout', logout);

// 获取当前用户信息
router.get('/me', getCurrentUser);

module.exports = router; 