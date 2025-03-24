import Dexie from 'dexie';

export const db = new Dexie('videoEditor');

db.version(1).stores({
  users: '++id, username, password, email, avatar, createdAt',
  works: '++id, userId, title, cover, createdAt',
  favorites: '++id, userId, workId, createdAt',
  likes: '++id, userId, workId, createdAt'
});

// 初始化数据库
db.on('ready', async () => {
  // 检查是否需要初始化示例数据
  const userCount = await db.users.count();
  if (userCount === 0) {
    console.log('Database is empty, initializing with demo data...');
  }
});

export default db; 