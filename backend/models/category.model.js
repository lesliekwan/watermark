/**
 * 分类模型
 */
const db = require('../database/db');
const { createLogger } = require('../utils/logger');

const logger = createLogger('category-model');

/**
 * 分类模型
 */
class CategoryModel {
  /**
   * 通过ID查找分类
   * @param {number} id 分类ID
   * @returns {Promise<object|null>} 分类对象
   */
  static async findById(id) {
    try {
      const category = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
      return category || null;
    } catch (error) {
      logger.error(`查找分类失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 创建分类
   * @param {object} categoryData 分类数据
   * @returns {Promise<object>} 新分类对象
   */
  static async create(categoryData) {
    try {
      // 检查分类名称是否已存在
      const existing = await db.get('SELECT * FROM categories WHERE name = ?', [categoryData.name]);
      if (existing) {
        throw new Error(`分类名称 "${categoryData.name}" 已存在`);
      }
      
      // 创建分类
      const result = await db.run(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [categoryData.name, categoryData.description || '']
      );
      
      // 获取新创建的分类
      const newCategory = await this.findById(result.lastID);
      
      logger.info(`分类创建成功: ${newCategory.name}, ID: ${newCategory.id}`);
      return newCategory;
    } catch (error) {
      logger.error(`创建分类失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 更新分类
   * @param {number} id 分类ID
   * @param {object} categoryData 分类数据
   * @returns {Promise<object>} 更新后的分类对象
   */
  static async update(id, categoryData) {
    try {
      // 检查分类是否存在
      const category = await this.findById(id);
      if (!category) {
        throw new Error(`ID为 ${id} 的分类不存在`);
      }
      
      // 如果要更改名称，检查名称是否已存在
      if (categoryData.name && categoryData.name !== category.name) {
        const existing = await db.get('SELECT * FROM categories WHERE name = ? AND id != ?', [categoryData.name, id]);
        if (existing) {
          throw new Error(`分类名称 "${categoryData.name}" 已存在`);
        }
      }
      
      // 更新分类
      await db.run(
        'UPDATE categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [
          categoryData.name || category.name,
          categoryData.description !== undefined ? categoryData.description : category.description,
          id
        ]
      );
      
      // 获取更新后的分类
      const updatedCategory = await this.findById(id);
      
      logger.info(`分类更新成功: ID ${id}`);
      return updatedCategory;
    } catch (error) {
      logger.error(`更新分类失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 删除分类
   * @param {number} id 分类ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async delete(id) {
    try {
      // 删除分类与模板的关联
      await db.run('DELETE FROM template_categories WHERE category_id = ?', [id]);
      
      // 删除分类
      const result = await db.run('DELETE FROM categories WHERE id = ?', [id]);
      
      logger.info(`分类删除${result.changes > 0 ? '成功' : '失败'}: ID ${id}`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`删除分类失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取所有分类
   * @returns {Promise<Array>} 分类列表
   */
  static async findAll() {
    try {
      const categories = await db.all('SELECT * FROM categories ORDER BY name');
      return categories;
    } catch (error) {
      logger.error(`获取分类列表失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取模板的所有分类
   * @param {number} templateId 模板ID
   * @returns {Promise<Array>} 分类列表
   */
  static async findByTemplate(templateId) {
    try {
      const categories = await db.all(`
        SELECT c.*
        FROM categories c
        JOIN template_categories tc ON c.id = tc.category_id
        WHERE tc.template_id = ?
        ORDER BY c.name
      `, [templateId]);
      
      return categories;
    } catch (error) {
      logger.error(`获取模板分类失败: ${error.message}`);
      throw error;
    }
  }
}

module.exports = CategoryModel; 