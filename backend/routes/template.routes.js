/**
 * 模板路由
 */
const express = require('express');
const { getTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate,
  favoriteTemplate, unfavoriteTemplate, likeTemplate, unlikeTemplate,
  getUserFavorites } = require('../controllers/template.controller');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');
const { imageUpload, handleUploadError } = require('../middlewares/upload.middleware');
const { templateValidation, validate } = require('../utils/validator');

const router = express.Router();

// 获取模板列表
router.get('/', getTemplates);

// 获取模板详情
router.get('/:id', getTemplateById);

// 创建模板
router.post('/', isAuthenticated, imageUpload.single('thumbnail'), handleUploadError, templateValidation, validate, createTemplate);

// 更新模板
router.put('/:id', isAuthenticated, imageUpload.single('thumbnail'), handleUploadError, updateTemplate);

// 删除模板
router.delete('/:id', isAuthenticated, deleteTemplate);

// 收藏模板
router.post('/:id/favorite', isAuthenticated, favoriteTemplate);

// 取消收藏
router.delete('/:id/favorite', isAuthenticated, unfavoriteTemplate);

// 点赞模板
router.post('/:id/like', isAuthenticated, likeTemplate);

// 取消点赞
router.delete('/:id/like', isAuthenticated, unlikeTemplate);

// 获取用户收藏的模板
router.get('/user/favorites', isAuthenticated, getUserFavorites);

module.exports = router; 