/**
 * 视频模型
 */
const db = require('../database/db');
const { createLogger } = require('../utils/logger');
const ffmpegUtils = require('../utils/ffmpeg');
const path = require('path');

const logger = createLogger('video-model');

/**
 * 视频模型
 */
class VideoModel {
  /**
   * 通过ID查找视频
   * @param {number} id 视频ID
   * @returns {Promise<object|null>} 视频对象
   */
  static async findById(id) {
    try {
      const video = await db.get('SELECT * FROM videos WHERE id = ?', [id]);
      return video || null;
    } catch (error) {
      logger.error(`查找视频失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 创建视频记录
   * @param {object} videoData 视频数据
   * @returns {Promise<object>} 新视频对象
   */
  static async create(videoData) {
    try {
      // 获取视频信息
      const videoPath = path.join(process.cwd(), 'uploads', videoData.file_path);
      let videoInfo;
      
      try {
        videoInfo = await ffmpegUtils.getVideoInfo(videoPath);
      } catch (error) {
        logger.warn(`获取视频信息失败: ${error.message}`);
        // 继续使用默认值
      }
      
      // 生成缩略图
      let thumbnailPath;
      try {
        thumbnailPath = await ffmpegUtils.generateThumbnail(videoPath);
      } catch (error) {
        logger.warn(`生成缩略图失败: ${error.message}`);
        // 继续使用默认缩略图
        thumbnailPath = 'thumbnails/default.jpg';
      }
      
      // 插入数据
      const result = await db.run(
        `INSERT INTO videos (
          user_id, title, description, file_path, 
          thumbnail_path, duration, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          videoData.user_id,
          videoData.title,
          videoData.description || '',
          videoData.file_path,
          thumbnailPath,
          videoInfo?.duration || 0,
          'ready'
        ]
      );
      
      // 获取新创建的视频记录
      const newVideo = await this.findById(result.lastID);
      
      logger.info(`视频记录创建成功: ${newVideo.title}, ID: ${newVideo.id}`);
      return newVideo;
    } catch (error) {
      logger.error(`创建视频记录失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 更新视频信息
   * @param {number} id 视频ID
   * @param {object} videoData 视频数据
   * @returns {Promise<object>} 更新后的视频对象
   */
  static async update(id, videoData) {
    try {
      const updateFields = [];
      const updateValues = [];
      
      // 构建更新字段和值
      if (videoData.title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(videoData.title);
      }
      
      if (videoData.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(videoData.description);
      }
      
      if (videoData.thumbnail_path) {
        updateFields.push('thumbnail_path = ?');
        updateValues.push(videoData.thumbnail_path);
      }
      
      if (videoData.file_path) {
        updateFields.push('file_path = ?');
        updateValues.push(videoData.file_path);
      }
      
      if (videoData.status) {
        updateFields.push('status = ?');
        updateValues.push(videoData.status);
      }
      
      if (videoData.duration) {
        updateFields.push('duration = ?');
        updateValues.push(videoData.duration);
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      
      // 如果没有要更新的字段，直接返回视频
      if (updateFields.length === 1) {
        return this.findById(id);
      }
      
      // 构建SQL查询
      const sql = `UPDATE videos SET ${updateFields.join(', ')} WHERE id = ?`;
      updateValues.push(id);
      
      // 执行更新
      await db.run(sql, updateValues);
      
      // 获取更新后的视频
      const updatedVideo = await this.findById(id);
      
      logger.info(`视频信息更新成功: ID ${id}`);
      return updatedVideo;
    } catch (error) {
      logger.error(`更新视频信息失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 删除视频
   * @param {number} id 视频ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async delete(id) {
    try {
      // 获取视频信息
      const video = await this.findById(id);
      if (!video) {
        return false;
      }
      
      // 执行删除操作
      const result = await db.run('DELETE FROM videos WHERE id = ?', [id]);
      
      logger.info(`视频删除${result.changes > 0 ? '成功' : '失败'}: ID ${id}`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`删除视频失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取用户的所有视频
   * @param {number} userId 用户ID
   * @param {number} limit 限制数量
   * @param {number} offset 偏移量
   * @returns {Promise<Array>} 视频列表
   */
  static async findByUserId(userId, limit = 10, offset = 0) {
    try {
      const videos = await db.all(
        'SELECT * FROM videos WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );
      
      return videos;
    } catch (error) {
      logger.error(`获取用户视频失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取用户视频总数
   * @param {number} userId 用户ID
   * @returns {Promise<number>} 视频总数
   */
  static async countByUserId(userId) {
    try {
      const result = await db.get('SELECT COUNT(*) as count FROM videos WHERE user_id = ?', [userId]);
      return result.count;
    } catch (error) {
      logger.error(`获取用户视频总数失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取所有视频
   * @param {number} limit 限制数量
   * @param {number} offset 偏移量
   * @returns {Promise<Array>} 视频列表
   */
  static async findAll(limit = 10, offset = 0) {
    try {
      const videos = await db.all(
        'SELECT * FROM videos ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      return videos;
    } catch (error) {
      logger.error(`获取视频列表失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取视频总数
   * @returns {Promise<number>} 视频总数
   */
  static async count() {
    try {
      const result = await db.get('SELECT COUNT(*) as count FROM videos');
      return result.count;
    } catch (error) {
      logger.error(`获取视频总数失败: ${error.message}`);
      throw error;
    }
  }
}

module.exports = VideoModel; 