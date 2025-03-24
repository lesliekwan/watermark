/**
 * 模板模型
 */
const db = require('../database/db');
const { createLogger } = require('../utils/logger');

const logger = createLogger('template-model');

/**
 * 模板模型
 */
class TemplateModel {
  /**
   * 通过ID查找模板
   * @param {number} id 模板ID
   * @returns {Promise<object|null>} 模板对象
   */
  static async findById(id) {
    try {
      const template = await db.get('SELECT * FROM templates WHERE id = ?', [id]);
      
      if (template) {
        // 将config从JSON字符串转换为对象
        template.config = JSON.parse(template.config);
        
        // 获取模板分类
        const categories = await db.all(`
          SELECT c.id, c.name, c.description
          FROM categories c
          JOIN template_categories tc ON c.id = tc.category_id
          WHERE tc.template_id = ?
        `, [id]);
        
        template.categories = categories;
      }
      
      return template || null;
    } catch (error) {
      logger.error(`查找模板失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 创建模板
   * @param {object} templateData 模板数据
   * @returns {Promise<object>} 新模板对象
   */
  static async create(templateData) {
    try {
      // 确保config是字符串
      const config = typeof templateData.config === 'string' 
        ? templateData.config 
        : JSON.stringify(templateData.config);
      
      // 插入数据
      const result = await db.run(
        `INSERT INTO templates (
          name, description, thumbnail_path, config, 
          category, created_by, is_public
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          templateData.name,
          templateData.description || '',
          templateData.thumbnail_path || null,
          config,
          templateData.category || null,
          templateData.created_by || null,
          templateData.is_public !== undefined ? templateData.is_public : 1
        ]
      );
      
      const templateId = result.lastID;
      
      // 如果有分类，添加分类关联
      if (templateData.categories && Array.isArray(templateData.categories) && templateData.categories.length > 0) {
        for (const categoryId of templateData.categories) {
          await db.run(
            'INSERT INTO template_categories (template_id, category_id) VALUES (?, ?)',
            [templateId, categoryId]
          );
        }
      }
      
      // 获取新创建的模板
      const newTemplate = await this.findById(templateId);
      
      logger.info(`模板创建成功: ${newTemplate.name}, ID: ${newTemplate.id}`);
      return newTemplate;
    } catch (error) {
      logger.error(`创建模板失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 更新模板
   * @param {number} id 模板ID
   * @param {object} templateData 模板数据
   * @returns {Promise<object>} 更新后的模板对象
   */
  static async update(id, templateData) {
    try {
      const updateFields = [];
      const updateValues = [];
      
      // 构建更新字段和值
      if (templateData.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(templateData.name);
      }
      
      if (templateData.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(templateData.description);
      }
      
      if (templateData.thumbnail_path !== undefined) {
        updateFields.push('thumbnail_path = ?');
        updateValues.push(templateData.thumbnail_path);
      }
      
      if (templateData.config !== undefined) {
        const config = typeof templateData.config === 'string' 
          ? templateData.config 
          : JSON.stringify(templateData.config);
        updateFields.push('config = ?');
        updateValues.push(config);
      }
      
      if (templateData.category !== undefined) {
        updateFields.push('category = ?');
        updateValues.push(templateData.category);
      }
      
      if (templateData.is_public !== undefined) {
        updateFields.push('is_public = ?');
        updateValues.push(templateData.is_public ? 1 : 0);
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      
      // 如果没有要更新的字段，且没有分类更新，直接返回模板
      if (updateFields.length === 1 && !templateData.categories) {
        return this.findById(id);
      }
      
      // 执行模板基本信息更新
      if (updateFields.length > 1) {
        // 构建SQL查询
        const sql = `UPDATE templates SET ${updateFields.join(', ')} WHERE id = ?`;
        updateValues.push(id);
        
        // 执行更新
        await db.run(sql, updateValues);
      }
      
      // 更新分类关联
      if (templateData.categories && Array.isArray(templateData.categories)) {
        // 删除现有关联
        await db.run('DELETE FROM template_categories WHERE template_id = ?', [id]);
        
        // 添加新关联
        for (const categoryId of templateData.categories) {
          await db.run(
            'INSERT INTO template_categories (template_id, category_id) VALUES (?, ?)',
            [id, categoryId]
          );
        }
      }
      
      // 获取更新后的模板
      const updatedTemplate = await this.findById(id);
      
      logger.info(`模板更新成功: ID ${id}`);
      return updatedTemplate;
    } catch (error) {
      logger.error(`更新模板失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 删除模板
   * @param {number} id 模板ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async delete(id) {
    try {
      // 删除模板分类关联
      await db.run('DELETE FROM template_categories WHERE template_id = ?', [id]);
      
      // 删除模板
      const result = await db.run('DELETE FROM templates WHERE id = ?', [id]);
      
      logger.info(`模板删除${result.changes > 0 ? '成功' : '失败'}: ID ${id}`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`删除模板失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取所有模板
   * @param {boolean} onlyPublic 是否只获取公开模板
   * @param {number} limit 限制数量
   * @param {number} offset 偏移量
   * @returns {Promise<Array>} 模板列表
   */
  static async findAll(onlyPublic = true, limit = 10, offset = 0) {
    try {
      let sql = 'SELECT * FROM templates';
      const params = [];
      
      if (onlyPublic) {
        sql += ' WHERE is_public = 1';
      }
      
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const templates = await db.all(sql, params);
      
      // 处理模板数据
      for (const template of templates) {
        // 将config从JSON字符串转换为对象
        template.config = JSON.parse(template.config);
        
        // 获取模板分类
        const categories = await db.all(`
          SELECT c.id, c.name, c.description
          FROM categories c
          JOIN template_categories tc ON c.id = tc.category_id
          WHERE tc.template_id = ?
        `, [template.id]);
        
        template.categories = categories;
      }
      
      return templates;
    } catch (error) {
      logger.error(`获取模板列表失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 按分类获取模板
   * @param {number} categoryId 分类ID
   * @param {boolean} onlyPublic 是否只获取公开模板
   * @param {number} limit 限制数量
   * @param {number} offset 偏移量
   * @returns {Promise<Array>} 模板列表
   */
  static async findByCategory(categoryId, onlyPublic = true, limit = 10, offset = 0) {
    try {
      let sql = `
        SELECT t.*
        FROM templates t
        JOIN template_categories tc ON t.id = tc.template_id
        WHERE tc.category_id = ?
      `;
      const params = [categoryId];
      
      if (onlyPublic) {
        sql += ' AND t.is_public = 1';
      }
      
      sql += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const templates = await db.all(sql, params);
      
      // 处理模板数据
      for (const template of templates) {
        // 将config从JSON字符串转换为对象
        template.config = JSON.parse(template.config);
        
        // 获取模板分类
        const categories = await db.all(`
          SELECT c.id, c.name, c.description
          FROM categories c
          JOIN template_categories tc ON c.id = tc.category_id
          WHERE tc.template_id = ?
        `, [template.id]);
        
        template.categories = categories;
      }
      
      return templates;
    } catch (error) {
      logger.error(`按分类获取模板失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取模板总数
   * @param {boolean} onlyPublic 是否只计算公开模板
   * @returns {Promise<number>} 模板总数
   */
  static async count(onlyPublic = true) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM templates';
      const params = [];
      
      if (onlyPublic) {
        sql += ' WHERE is_public = 1';
      }
      
      const result = await db.get(sql, params);
      return result.count;
    } catch (error) {
      logger.error(`获取模板总数失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取按分类的模板总数
   * @param {number} categoryId 分类ID
   * @param {boolean} onlyPublic 是否只计算公开模板
   * @returns {Promise<number>} 模板总数
   */
  static async countByCategory(categoryId, onlyPublic = true) {
    try {
      let sql = `
        SELECT COUNT(*) as count
        FROM templates t
        JOIN template_categories tc ON t.id = tc.template_id
        WHERE tc.category_id = ?
      `;
      const params = [categoryId];
      
      if (onlyPublic) {
        sql += ' AND t.is_public = 1';
      }
      
      const result = await db.get(sql, params);
      return result.count;
    } catch (error) {
      logger.error(`获取分类模板总数失败: ${error.message}`);
      throw error;
    }
  }
}

module.exports = TemplateModel; 