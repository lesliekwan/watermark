/**
 * 点赞模型
 */
const db = require('../database/db');
const { createLogger } = require('../utils/logger');

const logger = createLogger('like-model');

/**
 * 点赞模型
 */
class LikeModel {
  /**
   * 添加点赞
   * @param {number} userId 用户ID
   * @param {number} templateId 模板ID
   * @returns {Promise<object>} 点赞对象
   */
  static async add(userId, templateId) {
    try {
      // 检查是否已点赞
      const existing = await this.findByUserAndTemplate(userId, templateId);
      if (existing) {
        return existing;
      }
      
      // 添加点赞
      const result = await db.run(
        'INSERT INTO likes (user_id, template_id) VALUES (?, ?)',
        [userId, templateId]
      );
      
      const like = {
        id: result.lastID,
        user_id: userId,
        template_id: templateId,
        created_at: new Date().toISOString()
      };
      
      logger.info(`用户 ${userId} 点赞模板 ${templateId} 成功`);
      return like;
    } catch (error) {
      logger.error(`添加点赞失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 取消点赞
   * @param {number} userId 用户ID
   * @param {number} templateId 模板ID
   * @returns {Promise<boolean>} 取消结果
   */
  static async remove(userId, templateId) {
    try {
      const result = await db.run(
        'DELETE FROM likes WHERE user_id = ? AND template_id = ?',
        [userId, templateId]
      );
      
      logger.info(`用户 ${userId} 取消点赞模板 ${templateId} ${result.changes > 0 ? '成功' : '失败'}`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`取消点赞失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 通过用户ID和模板ID查找点赞
   * @param {number} userId 用户ID
   * @param {number} templateId 模板ID
   * @returns {Promise<object|null>} 点赞对象
   */
  static async findByUserAndTemplate(userId, templateId) {
    try {
      const like = await db.get(
        'SELECT * FROM likes WHERE user_id = ? AND template_id = ?',
        [userId, templateId]
      );
      
      return like || null;
    } catch (error) {
      logger.error(`查找点赞失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取模板点赞数
   * @param {number} templateId 模板ID
   * @returns {Promise<number>} 点赞数
   */
  static async countByTemplate(templateId) {
    try {
      const result = await db.get(
        'SELECT COUNT(*) as count FROM likes WHERE template_id = ?',
        [templateId]
      );
      
      return result.count;
    } catch (error) {
      logger.error(`获取模板点赞数失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取用户点赞的所有模板
   * @param {number} userId 用户ID
   * @param {number} limit 限制数量
   * @param {number} offset 偏移量
   * @returns {Promise<Array>} 模板列表
   */
  static async findTemplatesByUser(userId, limit = 10, offset = 0) {
    try {
      const templates = await db.all(`
        SELECT t.*, l.created_at as liked_at
        FROM templates t
        JOIN likes l ON t.id = l.template_id
        WHERE l.user_id = ?
        ORDER BY l.created_at DESC
        LIMIT ? OFFSET ?
      `, [userId, limit, offset]);
      
      // 处理模板数据
      for (const template of templates) {
        // 将config从JSON字符串转换为对象
        template.config = JSON.parse(template.config);
      }
      
      return templates;
    } catch (error) {
      logger.error(`获取用户点赞模板失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取用户点赞总数
   * @param {number} userId 用户ID
   * @returns {Promise<number>} 点赞总数
   */
  static async countByUser(userId) {
    try {
      const result = await db.get(
        'SELECT COUNT(*) as count FROM likes WHERE user_id = ?',
        [userId]
      );
      
      return result.count;
    } catch (error) {
      logger.error(`获取用户点赞总数失败: ${error.message}`);
      throw error;
    }
  }
}

module.exports = LikeModel; 