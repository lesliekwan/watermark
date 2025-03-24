/**
 * 认证中间件
 */
const { createLogger } = require('../utils/logger');

const logger = createLogger('auth-middleware');

/**
 * 检查用户是否已登录
 */
function isAuthenticated(req, res, next) {
  if (!req.session || !req.session.userId) {
    logger.warn(`未认证的访问: ${req.originalUrl}`);
    return res.status(401).json({
      success: false,
      error: {
        message: '请先登录',
        code: 'UNAUTHORIZED'
      }
    });
  }
  
  next();
}

/**
 * 检查用户是否是管理员
 */
function isAdmin(req, res, next) {
  if (!req.session || !req.session.userId || !req.session.isAdmin) {
    logger.warn(`非管理员访问: ${req.originalUrl}, 用户ID: ${req.session?.userId}`);
    return res.status(403).json({
      success: false,
      error: {
        message: '您没有权限执行此操作',
        code: 'FORBIDDEN'
      }
    });
  }
  
  next();
}

module.exports = {
  isAuthenticated,
  isAdmin
}; 