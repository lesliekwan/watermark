/**
 * 认证控制器
 */
const UserModel = require('../models/user.model');
const { createLogger } = require('../utils/logger');

const logger = createLogger('auth-controller');

/**
 * 用户注册
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    
    // 创建用户
    const user = await UserModel.create({
      username,
      email,
      password
    });
    
    // 返回用户信息（不包含密码）
    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin,
        created_at: user.created_at
      }
    });
    
    logger.info(`用户注册成功: ${username}, ${email}`);
  } catch (error) {
    logger.error(`用户注册失败: ${error.message}`);
    
    // 处理常见错误
    if (error.message.includes('已被注册') || error.message.includes('已被使用')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
}

/**
 * 用户登录
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码不正确'
      });
    }
    
    // 检查用户状态
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用，请联系管理员'
      });
    }
    
    // 验证密码
    const isPasswordValid = await UserModel.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码不正确'
      });
    }
    
    // 设置会话
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.isAdmin = user.is_admin === 1;
    
    // 返回用户信息
    res.json({
      success: true,
      message: '登录成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin === 1,
        created_at: user.created_at
      }
    });
    
    logger.info(`用户登录成功: ${user.username}, ID: ${user.id}`);
  } catch (error) {
    logger.error(`用户登录失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
}

/**
 * 退出登录
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
function logout(req, res) {
  try {
    const userId = req.session.userId;
    const username = req.session.username;
    
    // 清除会话
    req.session.destroy((err) => {
      if (err) {
        logger.error(`退出登录失败: ${err.message}`);
        return res.status(500).json({
          success: false,
          message: '退出登录失败，请稍后重试'
        });
      }
      
      res.json({
        success: true,
        message: '已成功退出登录'
      });
      
      logger.info(`用户退出登录: ${username}, ID: ${userId}`);
    });
  } catch (error) {
    logger.error(`退出登录失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '退出登录失败，请稍后重试'
    });
  }
}

/**
 * 获取当前用户信息
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function getCurrentUser(req, res) {
  try {
    const userId = req.session.userId;
    
    // 如果没有登录
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }
    
    // 获取用户信息
    const user = await UserModel.findById(userId);
    if (!user) {
      // 清除无效会话
      req.session.destroy();
      
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被删除'
      });
    }
    
    // 返回用户信息
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin === 1,
        created_at: user.created_at
      }
    });
  } catch (error) {
    logger.error(`获取当前用户信息失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败，请稍后重试'
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
}; 