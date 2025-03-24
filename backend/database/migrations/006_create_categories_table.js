/**
 * 创建分类表迁移
 */
const db = require('../db');

module.exports = {
  up: async () => {
    await db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建模板分类关联表
    await db.run(`
      CREATE TABLE IF NOT EXISTS template_categories (
        template_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        PRIMARY KEY (template_id, category_id),
        FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
      )
    `);
  },
  down: async () => {
    await db.run('DROP TABLE IF EXISTS template_categories');
    await db.run('DROP TABLE IF EXISTS categories');
  }
}; 