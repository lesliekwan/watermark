/**
 * 数据库连接模块
 */
const sqlite3 = require('sqlite3').verbose();
const { DATABASE_PATH } = require('../config/db.config');
const { createLogger } = require('../utils/logger');

const logger = createLogger('database');

// 数据库连接实例
let db = null;

/**
 * 初始化数据库连接
 */
function init() {
  return new Promise((resolve, reject) => {
    try {
      db = new sqlite3.Database(DATABASE_PATH, (err) => {
        if (err) {
          logger.error(`数据库连接失败: ${err.message}`);
          reject(err);
          return;
        }
        
        logger.info('成功连接到SQLite数据库');
        resolve(db);
      });
    } catch (error) {
      logger.error(`数据库初始化错误: ${error.message}`);
      reject(error);
    }
  });
}

/**
 * 运行SQL查询
 * @param {string} sql SQL语句
 * @param {Array} params 参数
 * @returns {Promise}
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        logger.error(`SQL执行错误: ${sql}, 错误: ${err.message}`);
        reject(err);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * 获取单条记录
 * @param {string} sql SQL语句
 * @param {Array} params 参数
 * @returns {Promise}
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        logger.error(`SQL执行错误: ${sql}, 错误: ${err.message}`);
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

/**
 * 获取多条记录
 * @param {string} sql SQL语句
 * @param {Array} params 参数
 * @returns {Promise}
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        logger.error(`SQL执行错误: ${sql}, 错误: ${err.message}`);
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

/**
 * 关闭数据库连接
 */
function close() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          logger.error(`关闭数据库连接错误: ${err.message}`);
          reject(err);
          return;
        }
        logger.info('数据库连接已关闭');
        db = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  init,
  run,
  get,
  all,
  close,
  db
}; 