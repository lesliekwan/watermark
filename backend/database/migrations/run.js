/**
 * 数据库迁移脚本执行器
 */
const fs = require('fs');
const path = require('path');
const db = require('../db');
const { createLogger } = require('../../utils/logger');

const logger = createLogger('migration');

// 迁移表名
const MIGRATION_TABLE = 'migrations';

/**
 * 创建迁移表
 */
async function createMigrationTable() {
  try {
    await db.run(`
      CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('迁移表创建成功或已存在');
  } catch (error) {
    logger.error(`创建迁移表失败: ${error.message}`);
    throw error;
  }
}

/**
 * 获取已执行的迁移
 */
async function getExecutedMigrations() {
  try {
    const rows = await db.all(`SELECT name FROM ${MIGRATION_TABLE}`);
    return rows.map(row => row.name);
  } catch (error) {
    logger.error(`获取已执行迁移失败: ${error.message}`);
    throw error;
  }
}

/**
 * 标记迁移为已执行
 * @param {string} name 迁移文件名
 */
async function markMigrationAsExecuted(name) {
  try {
    await db.run(`INSERT INTO ${MIGRATION_TABLE} (name) VALUES (?)`, [name]);
    logger.info(`迁移 ${name} 标记为已执行`);
  } catch (error) {
    logger.error(`标记迁移失败: ${error.message}`);
    throw error;
  }
}

/**
 * 运行迁移
 */
async function runMigrations() {
  try {
    // 初始化数据库连接
    await db.init();
    
    // 创建迁移表
    await createMigrationTable();
    
    // 获取已执行的迁移
    const executedMigrations = await getExecutedMigrations();
    
    // 获取迁移目录中的所有迁移文件
    const migrationFiles = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.js') && file !== 'run.js')
      .sort();
    
    // 执行未运行的迁移
    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        logger.info(`执行迁移: ${file}`);
        
        // 导入迁移模块
        const migration = require(path.join(__dirname, file));
        
        // 执行迁移
        await migration.up();
        
        // 标记迁移为已执行
        await markMigrationAsExecuted(file);
        
        logger.info(`迁移 ${file} 完成`);
      } else {
        logger.info(`迁移 ${file} 已执行，跳过`);
      }
    }
    
    logger.info('所有迁移执行完毕');
  } catch (error) {
    logger.error(`迁移执行失败: ${error.message}`);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await db.close();
  }
}

// 执行迁移
runMigrations(); 