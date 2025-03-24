/**
 * 模板控制器
 */
const TemplateModel = require('../models/template.model');
const CategoryModel = require('../models/category.model');
const FavoriteModel = require('../models/favorite.model');
const LikeModel = require('../models/like.model');
const { createLogger } = require('../utils/logger');

const logger = createLogger('template-controller');

/**
 * 获取模板列表
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function getTemplates(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const categoryId = parseInt(req.query.category) || null;
    
    // 是否只获取公开模板
    const isAdmin = req.session.isAdmin;
    const onlyPublic = !isAdmin;
    
    let templates;
    let total;
    
    if (categoryId) {
      // 按分类获取模板
      templates = await TemplateModel.findByCategory(categoryId, onlyPublic, limit, offset);
      total = await TemplateModel.countByCategory(categoryId, onlyPublic);
    } else {
      // 获取所有模板
      templates = await TemplateModel.findAll(onlyPublic, limit, offset);
      total = await TemplateModel.count(onlyPublic);
    }
    
    // 如果用户已登录，标记是否已收藏和点赞
    if (req.session.userId) {
      const userId = req.session.userId;
      
      for (const template of templates) {
        // 检查是否收藏
        const favorite = await FavoriteModel.findByUserAndTemplate(userId, template.id);
        template.is_favorited = !!favorite;
        
        // 检查是否点赞
        const like = await LikeModel.findByUserAndTemplate(userId, template.id);
        template.is_liked = !!like;
        
        // 获取收藏和点赞数量
        template.favorites_count = await FavoriteModel.countByTemplate(template.id);
        template.likes_count = await LikeModel.countByTemplate(template.id);
      }
    }
    
    res.json({
      success: true,
      data: {
        templates,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error(`获取模板列表失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '获取模板列表失败，请稍后重试'
    });
  }
}

/**
 * 获取模板详情
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function getTemplateById(req, res) {
  try {
    const templateId = parseInt(req.params.id);
    
    // 获取模板信息
    const template = await TemplateModel.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    // 检查访问权限
    const isAdmin = req.session.isAdmin;
    if (!template.is_public && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权访问此模板'
      });
    }
    
    // 如果用户已登录，标记是否已收藏和点赞
    if (req.session.userId) {
      const userId = req.session.userId;
      
      // 检查是否收藏
      const favorite = await FavoriteModel.findByUserAndTemplate(userId, template.id);
      template.is_favorited = !!favorite;
      
      // 检查是否点赞
      const like = await LikeModel.findByUserAndTemplate(userId, template.id);
      template.is_liked = !!like;
    }
    
    // 获取收藏和点赞数量
    template.favorites_count = await FavoriteModel.countByTemplate(template.id);
    template.likes_count = await LikeModel.countByTemplate(template.id);
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error(`获取模板详情失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '获取模板详情失败，请稍后重试'
    });
  }
}

/**
 * 创建模板
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function createTemplate(req, res) {
  try {
    const { name, description, config, is_public, categories } = req.body;
    const userId = req.session.userId;
    
    let thumbnailPath = null;
    
    // 处理缩略图上传
    if (req.file) {
      thumbnailPath = `images/${req.file.filename}`;
    }
    
    // 创建模板
    const template = await TemplateModel.create({
      name,
      description,
      thumbnail_path: thumbnailPath,
      config,
      created_by: userId,
      is_public: is_public !== undefined ? is_public : true,
      categories: categories ? JSON.parse(categories) : []
    });
    
    res.status(201).json({
      success: true,
      message: '模板创建成功',
      data: template
    });
    
    logger.info(`模板创建成功: ${name}, ID: ${template.id}, 用户: ${userId}`);
  } catch (error) {
    logger.error(`创建模板失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '创建模板失败，请稍后重试'
    });
  }
}

/**
 * 更新模板
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function updateTemplate(req, res) {
  try {
    const templateId = parseInt(req.params.id);
    const { name, description, config, is_public, categories } = req.body;
    
    // 获取模板信息
    const template = await TemplateModel.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    // 检查权限
    const userId = req.session.userId;
    const isAdmin = req.session.isAdmin;
    
    if (template.created_by !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权修改此模板'
      });
    }
    
    // 处理缩略图上传
    let thumbnailPath = undefined;
    if (req.file) {
      thumbnailPath = `images/${req.file.filename}`;
    }
    
    // 更新模板
    const updateData = {
      name,
      description,
      config,
      is_public
    };
    
    if (thumbnailPath) {
      updateData.thumbnail_path = thumbnailPath;
    }
    
    if (categories) {
      updateData.categories = JSON.parse(categories);
    }
    
    const updatedTemplate = await TemplateModel.update(templateId, updateData);
    
    res.json({
      success: true,
      message: '模板更新成功',
      data: updatedTemplate
    });
    
    logger.info(`模板更新成功: ID ${templateId}, 用户: ${userId}`);
  } catch (error) {
    logger.error(`更新模板失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '更新模板失败，请稍后重试'
    });
  }
}

/**
 * 删除模板
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function deleteTemplate(req, res) {
  try {
    const templateId = parseInt(req.params.id);
    
    // 获取模板信息
    const template = await TemplateModel.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    // 检查权限
    const userId = req.session.userId;
    const isAdmin = req.session.isAdmin;
    
    if (template.created_by !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权删除此模板'
      });
    }
    
    // 删除模板
    await TemplateModel.delete(templateId);
    
    res.json({
      success: true,
      message: '模板已删除'
    });
    
    logger.info(`模板删除成功: ID ${templateId}, 用户: ${userId}`);
  } catch (error) {
    logger.error(`删除模板失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '删除模板失败，请稍后重试'
    });
  }
}

/**
 * 收藏模板
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function favoriteTemplate(req, res) {
  try {
    const templateId = parseInt(req.params.id);
    const userId = req.session.userId;
    
    // 检查模板是否存在
    const template = await TemplateModel.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    // 添加收藏
    await FavoriteModel.add(userId, templateId);
    
    res.json({
      success: true,
      message: '模板收藏成功'
    });
    
    logger.info(`模板收藏成功: ID ${templateId}, 用户: ${userId}`);
  } catch (error) {
    logger.error(`收藏模板失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '收藏模板失败，请稍后重试'
    });
  }
}

/**
 * 取消收藏模板
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function unfavoriteTemplate(req, res) {
  try {
    const templateId = parseInt(req.params.id);
    const userId = req.session.userId;
    
    // 取消收藏
    const result = await FavoriteModel.remove(userId, templateId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: '未找到收藏记录'
      });
    }
    
    res.json({
      success: true,
      message: '已取消收藏'
    });
    
    logger.info(`取消收藏成功: 模板ID ${templateId}, 用户: ${userId}`);
  } catch (error) {
    logger.error(`取消收藏失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '取消收藏失败，请稍后重试'
    });
  }
}

/**
 * 点赞模板
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function likeTemplate(req, res) {
  try {
    const templateId = parseInt(req.params.id);
    const userId = req.session.userId;
    
    // 检查模板是否存在
    const template = await TemplateModel.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    // 添加点赞
    await LikeModel.add(userId, templateId);
    
    res.json({
      success: true,
      message: '模板点赞成功'
    });
    
    logger.info(`模板点赞成功: ID ${templateId}, 用户: ${userId}`);
  } catch (error) {
    logger.error(`点赞模板失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '点赞模板失败，请稍后重试'
    });
  }
}

/**
 * 取消点赞模板
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function unlikeTemplate(req, res) {
  try {
    const templateId = parseInt(req.params.id);
    const userId = req.session.userId;
    
    // 取消点赞
    const result = await LikeModel.remove(userId, templateId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: '未找到点赞记录'
      });
    }
    
    res.json({
      success: true,
      message: '已取消点赞'
    });
    
    logger.info(`取消点赞成功: 模板ID ${templateId}, 用户: ${userId}`);
  } catch (error) {
    logger.error(`取消点赞失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '取消点赞失败，请稍后重试'
    });
  }
}

/**
 * 获取用户收藏的模板
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function getUserFavorites(req, res) {
  try {
    const userId = req.session.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // 获取收藏的模板
    const favorites = await FavoriteModel.findByUser(userId, limit, offset);
    
    // 获取收藏总数
    const total = await FavoriteModel.countByUser(userId);
    
    res.json({
      success: true,
      data: {
        favorites,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error(`获取用户收藏失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '获取收藏列表失败，请稍后重试'
    });
  }
}

module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  favoriteTemplate,
  unfavoriteTemplate,
  likeTemplate,
  unlikeTemplate,
  getUserFavorites
}; 