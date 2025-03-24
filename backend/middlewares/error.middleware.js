/**
 * 错误处理中间件
 */
const { createLogger } = require('../utils/logger');

const logger = createLogger('error-middleware');

/**
 * 全局错误处理中间件
 */
function errorMiddleware(err, req, res, next) {
  // 记录错误
  logger.error(`错误: ${err.message}, 堆栈: ${err.stack}`);
  
  // 确定响应状态码
  const statusCode = err.statusCode || 500;
  
  // 构建错误响应
  const errorResponse = {
    success: false,
    error: {
      message: err.message || '服务器内部错误',
      code: err.code || 'INTERNAL_SERVER_ERROR'
    }
  };
  
  // 开发环境下返回错误堆栈
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error.stack = err.stack;
  }
  
  // 发送响应
  res.status(statusCode).json(errorResponse);
}

module.exports = errorMiddleware; 