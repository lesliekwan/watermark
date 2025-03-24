/**
 * 视频编辑器后端应用入口
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const { createLogger } = require('./utils/logger');

// 导入路由
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const videoRoutes = require('./routes/video.routes');
const templateRoutes = require('./routes/template.routes');
const categoryRoutes = require('./routes/category.routes');

// 导入中间件
const errorMiddleware = require('./middlewares/error.middleware');

// 导入配置
const appConfig = require('./config/app.config');
const dbConnection = require('./database/db');
const UserModel = require('./models/user.model');

// 初始化日志
const logger = createLogger('app');

// 初始化Express应用
const app = express();

// 连接数据库
dbConnection.init().then(() => {
  createDefaultAdmin();
}).catch(err => {
  logger.error(`数据库初始化失败: ${err.message}`);
});

// 基础中间件
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// 会话配置
app.use(session({
  secret: appConfig.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: appConfig.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 静态文件目录
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, '../docs/ui-prototype/admin')));

// 注册路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/categories', categoryRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({ message: '视频编辑器API服务运行中' });
});

// 添加重定向，确保/admin路径直接访问登录页面
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../docs/ui-prototype/admin/login.html'));
});

// 错误处理中间件
app.use(errorMiddleware);

// 启动服务器
const PORT = appConfig.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`服务器运行在端口: ${PORT}`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (error) => {
  logger.error('未处理的Promise拒绝:', error);
});

// 自动创建默认管理员账号
async function createDefaultAdmin() {
  try {
    // 检查管理员是否已存在
    const adminEmail = 'admin@system.com';
    const existingAdmin = await UserModel.findByEmail(adminEmail);
    
    if (!existingAdmin) {
      logger.info('创建默认管理员账号...');
      await UserModel.create({
        username: 'admin',
        email: adminEmail,
        password: 'Admin@123',
        isAdmin: 1
      });
      logger.info('默认管理员账号创建成功');
    }
  } catch (error) {
    logger.error(`创建默认管理员失败: ${error.message}`);
  }
}

module.exports = app; 