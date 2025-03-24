/**
 * 收藏模型
 */
const db = require('../database/db');
const { createLogger } = require('../utils/logger');

const logger = createLogger('favorite-model');

/**
 * 收藏模型
 */
class FavoriteModel {
  /**
   * 添加收藏
   * @param {number} userId 用户ID
   * @param {number} templateId 模板ID
   * @returns {Promise<object>} 收藏对象
   */
  static async add(userId, templateId) {
    try {
      // 检查是否已收藏
      const existing = await this.findByUserAndTemplate(userId, templateId);
      if (existing) {
        return existing;
      }
      
      // 添加收藏
      const result = await db.run(
        'INSERT INTO favorites (user_id, template_id) VALUES (?, ?)',
        [userId, templateId]
      );
      
      const favorite = {
        id: result.lastID,
        user_id: userId,
        template_id: templateId,
        created_at: new Date().toISOString()
      };
      
      logger.info(`用户 ${userId} 收藏模板 ${templateId} 成功`);
      return favorite;
    } catch (error) {
      logger.error(`添加收藏失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 取消收藏
   * @param {number} userId 用户ID
   * @param {number} templateId 模板ID
   * @returns {Promise<boolean>} 取消结果
   */
  static async remove(userId, templateId) {
    try {
      const result = await db.run(
        'DELETE FROM favorites WHERE user_id = ? AND template_id = ?',
        [userId, templateId]
      );
      
      logger.info(`用户 ${userId} 取消收藏模板 ${templateId} ${result.changes > 0 ? '成功' : '失败'}`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`取消收藏失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 查找用户的所有收藏
   * @param {number} userId 用户ID
   * @param {number} limit 限制数量
   * @param {number} offset 偏移量
   * @returns {Promise<Array>} 收藏列表
   */
  static async findByUser(userId, limit = 10, offset = 0) {
    try {
      const favorites = await db.all(`
        SELECT f.*, t.name as template_name, t.thumbnail_path
        FROM favorites f
        JOIN templates t ON f.template_id = t.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `, [userId, limit, offset]);
      
      return favorites;
    } catch (error) {
      logger.error(`获取用户收藏失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 通过用户ID和模板ID查找收藏
   * @param {number} userId 用户ID
   * @param {number} templateId 模板ID
   * @returns {Promise<object|null>} 收藏对象
   */
  static async findByUserAndTemplate(userId, templateId) {
    try {
      const favorite = await db.get(
        'SELECT * FROM favorites WHERE user_id = ? AND template_id = ?',
        [userId, templateId]
      );
      
      return favorite || null;
    } catch (error) {
      logger.error(`查找收藏失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取用户收藏总数
   * @param {number} userId 用户ID
   * @returns {Promise<number>} 收藏总数
   */
  static async countByUser(userId) {
    try {
      const result = await db.get(
        'SELECT COUNT(*) as count FROM favorites WHERE user_id = ?',
        [userId]
      );
      
      return result.count;
    } catch (error) {
      logger.error(`获取用户收藏总数失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取模板被收藏次数
   * @param {number} templateId 模板ID
   * @returns {Promise<number>} 收藏次数
   */
  static async countByTemplate(templateId) {
    try {
      const result = await db.get(
        'SELECT COUNT(*) as count FROM favorites WHERE template_id = ?',
        [templateId]
      );
      
      return result.count;
    } catch (error) {
      logger.error(`获取模板收藏次数失败: ${error.message}`);
      throw error;
    }
  }
}

module.exports = FavoriteModel; 