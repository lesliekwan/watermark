/**
 * 创建模板表迁移
 */
const db = require('../db');

module.exports = {
  up: async () => {
    await db.run(`
      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        thumbnail_path TEXT,
        config TEXT NOT NULL,
        category TEXT,
        created_by INTEGER,
        is_public INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
      )
    `);
  },
  down: async () => {
    await db.run('DROP TABLE IF EXISTS templates');
  }
}; 