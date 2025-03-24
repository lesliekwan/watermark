/**
 * 数据库配置
 */
const path = require('path');

const dbConfig = {
  // SQLite数据库文件路径
  DATABASE_PATH: process.env.DATABASE_PATH || path.join(__dirname, '../database/video_editor.db'),
  
  // 连接配置
  connection: {
    filename: process.env.DATABASE_PATH || path.join(__dirname, '../database/video_editor.db'),
  },
  
  // 迁移配置
  migrations: {
    directory: path.join(__dirname, '../database/migrations'),
  },
};

module.exports = dbConfig; 