/**
 * 用户模型
 */
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { BCRYPT_SALT_ROUNDS } = require('../config/app.config');
const { createLogger } = require('../utils/logger');

const logger = createLogger('user-model');

/**
 * 用户模型
 */
class UserModel {
  /**
   * 通过ID查找用户
   * @param {number} id 用户ID
   * @returns {Promise<object|null>} 用户对象
   */
  static async findById(id) {
    try {
      const user = await db.get(
        'SELECT id, username, email, is_admin, is_active, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      
      return user || null;
    } catch (error) {
      logger.error(`查找用户失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 通过邮箱查找用户
   * @param {string} email 用户邮箱
   * @returns {Promise<object|null>} 用户对象
   */
  static async findByEmail(email) {
    try {
      const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      return user || null;
    } catch (error) {
      logger.error(`通过邮箱查找用户失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 通过用户名查找用户
   * @param {string} username 用户名
   * @returns {Promise<object|null>} 用户对象
   */
  static async findByUsername(username) {
    try {
      const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
      return user || null;
    } catch (error) {
      logger.error(`通过用户名查找用户失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 创建新用户
   * @param {object} userData 用户数据
   * @returns {Promise<object>} 新用户对象
   */
  static async create(userData) {
    try {
      // 检查邮箱是否已存在
      const existingEmail = await this.findByEmail(userData.email);
      if (existingEmail) {
        throw new Error('该邮箱已被注册');
      }
      
      // 检查用户名是否已存在
      const existingUsername = await this.findByUsername(userData.username);
      if (existingUsername) {
        throw new Error('该用户名已被使用');
      }
      
      // 加密密码
      const hashedPassword = await bcrypt.hash(userData.password, BCRYPT_SALT_ROUNDS);
      
      // 创建用户
      const result = await db.run(
        'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)',
        [userData.username, userData.email, hashedPassword, userData.isAdmin || 0]
      );
      
      // 获取新创建的用户
      const newUser = await this.findById(result.lastID);
      
      logger.info(`新用户创建成功: ${newUser.username}, ID: ${newUser.id}`);
      return newUser;
    } catch (error) {
      logger.error(`创建用户失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 更新用户信息
   * @param {number} id 用户ID
   * @param {object} userData 用户数据
   * @returns {Promise<object>} 更新后的用户对象
   */
  static async update(id, userData) {
    try {
      const updateFields = [];
      const updateValues = [];
      
      // 构建更新字段和值
      if (userData.username) {
        updateFields.push('username = ?');
        updateValues.push(userData.username);
      }
      
      if (userData.email) {
        updateFields.push('email = ?');
        updateValues.push(userData.email);
      }
      
      if (userData.password) {
        const hashedPassword = await bcrypt.hash(userData.password, BCRYPT_SALT_ROUNDS);
        updateFields.push('password = ?');
        updateValues.push(hashedPassword);
      }
      
      if (userData.isActive !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(userData.isActive ? 1 : 0);
      }
      
      if (userData.isAdmin !== undefined) {
        updateFields.push('is_admin = ?');
        updateValues.push(userData.isAdmin ? 1 : 0);
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      
      // 如果没有要更新的字段，直接返回用户
      if (updateFields.length === 1) {
        return this.findById(id);
      }
      
      // 构建SQL查询
      const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      updateValues.push(id);
      
      // 执行更新
      await db.run(sql, updateValues);
      
      // 获取更新后的用户
      const updatedUser = await this.findById(id);
      
      logger.info(`用户信息更新成功: ID ${id}`);
      return updatedUser;
    } catch (error) {
      logger.error(`更新用户信息失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 验证用户密码
   * @param {string} password 明文密码
   * @param {string} hashedPassword 加密后的密码
   * @returns {Promise<boolean>} 验证结果
   */
  static async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error(`密码验证失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取所有用户列表
   * @param {number} limit 限制数量
   * @param {number} offset 偏移量
   * @returns {Promise<Array>} 用户列表
   */
  static async findAll(limit = 10, offset = 0) {
    try {
      const users = await db.all(
        'SELECT id, username, email, is_admin, is_active, created_at, updated_at FROM users LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      return users;
    } catch (error) {
      logger.error(`获取用户列表失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取用户总数
   * @returns {Promise<number>} 用户总数
   */
  static async count() {
    try {
      const result = await db.get('SELECT COUNT(*) as count FROM users');
      return result.count;
    } catch (error) {
      logger.error(`获取用户总数失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 删除用户
   * @param {number} id 用户ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async delete(id) {
    try {
      const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
      
      logger.info(`用户删除${result.changes > 0 ? '成功' : '失败'}: ID ${id}`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`删除用户失败: ${error.message}`);
      throw error;
    }
  }
}

module.exports = UserModel; 