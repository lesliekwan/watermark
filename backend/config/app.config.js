/**
 * 应用全局配置
 */
require('dotenv').config();

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  SESSION_SECRET: process.env.SESSION_SECRET || 'video-editor-secret-key',
  
  // 文件上传配置
  UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 100 * 1024 * 1024, // 100MB
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/mpeg'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  
  // 视频处理配置
  FFMPEG_PATH: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',
  VIDEO_PROCESS_TIMEOUT: process.env.VIDEO_PROCESS_TIMEOUT || 300000, // 5分钟
  
  // 安全配置
  BCRYPT_SALT_ROUNDS: 10,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

module.exports = config; 