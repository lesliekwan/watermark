/**
 * 分类控制器
 */
const CategoryModel = require('../models/category.model');
const { createLogger } = require('../utils/logger');

const logger = createLogger('category-controller');

/**
 * 获取所有分类
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function getCategories(req, res) {
  try {
    // 获取所有分类
    const categories = await CategoryModel.findAll();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error(`获取分类列表失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败，请稍后重试'
    });
  }
}

/**
 * 创建分类（管理员）
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    
    // 创建分类
    const category = await CategoryModel.create({
      name,
      description
    });
    
    res.status(201).json({
      success: true,
      message: '分类创建成功',
      data: category
    });
    
    logger.info(`分类创建成功: ${name}, ID: ${category.id}`);
  } catch (error) {
    logger.error(`创建分类失败: ${error.message}`);
    
    if (error.message.includes('已存在')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: '创建分类失败，请稍后重试'
    });
  }
}

/**
 * 更新分类（管理员）
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function updateCategory(req, res) {
  try {
    const categoryId = parseInt(req.params.id);
    const { name, description } = req.body;
    
    // 更新分类
    const category = await CategoryModel.update(categoryId, {
      name,
      description
    });
    
    res.json({
      success: true,
      message: '分类更新成功',
      data: category
    });
    
    logger.info(`分类更新成功: ID ${categoryId}`);
  } catch (error) {
    logger.error(`更新分类失败: ${error.message}`);
    
    if (error.message.includes('已存在') || error.message.includes('不存在')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: '更新分类失败，请稍后重试'
    });
  }
}

/**
 * 删除分类（管理员）
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function deleteCategory(req, res) {
  try {
    const categoryId = parseInt(req.params.id);
    
    // 删除分类
    const result = await CategoryModel.delete(categoryId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }
    
    res.json({
      success: true,
      message: '分类已删除'
    });
    
    logger.info(`分类删除成功: ID ${categoryId}`);
  } catch (error) {
    logger.error(`删除分类失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '删除分类失败，请稍后重试'
    });
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
}; 