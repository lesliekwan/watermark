/**
 * 创建点赞表迁移
 */
const db = require('../db');

module.exports = {
  up: async () => {
    await db.run(`
      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        template_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE,
        UNIQUE (user_id, template_id)
      )
    `);
  },
  down: async () => {
    await db.run('DROP TABLE IF EXISTS likes');
  }
}; 