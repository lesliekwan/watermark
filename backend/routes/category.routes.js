/**
 * 分类路由
 */
const express = require('express');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// 获取所有分类
router.get('/', getCategories);

// 创建分类（管理员）
router.post('/', isAuthenticated, isAdmin, createCategory);

// 更新分类（管理员）
router.put('/:id', isAuthenticated, isAdmin, updateCategory);

// 删除分类（管理员）
router.delete('/:id', isAuthenticated, isAdmin, deleteCategory);

module.exports = router; 