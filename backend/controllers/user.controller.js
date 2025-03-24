/**
 * 用户控制器
 */
const UserModel = require('../models/user.model');
const VideoModel = require('../models/video.model');
const { createLogger } = require('../utils/logger');

const logger = createLogger('user-controller');

/**
 * 获取用户列表（管理员）
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function getUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // 获取用户列表
    const users = await UserModel.findAll(limit, offset);
    
    // 获取用户总数
    const total = await UserModel.count();
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error(`获取用户列表失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败，请稍后重试'
    });
  }
}

/**
 * 获取单个用户信息（管理员）
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function getUserById(req, res) {
  try {
    const userId = parseInt(req.params.id);
    
    // 获取用户信息
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 获取用户视频数量
    const videoCount = await VideoModel.countByUserId(userId);
    
    res.json({
      success: true,
      data: {
        ...user,
        video_count: videoCount
      }
    });
  } catch (error) {
    logger.error(`获取用户信息失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败，请稍后重试'
    });
  }
}

/**
 * 更新用户状态（启用/禁用）（管理员）
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function updateUserStatus(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const { isActive } = req.body;
    
    // 检查用户是否存在
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 管理员不能被禁用
    if (user.is_admin === 1 && isActive === false) {
      return res.status(400).json({
        success: false,
        message: '不能禁用管理员账号'
      });
    }
    
    // 更新用户状态
    const updatedUser = await UserModel.update(userId, { isActive });
    
    res.json({
      success: true,
      message: isActive ? '用户已启用' : '用户已禁用',
      data: updatedUser
    });
    
    logger.info(`更新用户状态成功: ID ${userId}, 状态: ${isActive ? '启用' : '禁用'}`);
  } catch (error) {
    logger.error(`更新用户状态失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '更新用户状态失败，请稍后重试'
    });
  }
}

/**
 * 修改用户密码
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function changePassword(req, res) {
  try {
    const userId = req.session.userId;
    const { currentPassword, newPassword } = req.body;
    
    // 获取用户信息
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 验证当前密码
    const isPasswordValid = await UserModel.verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '当前密码不正确'
      });
    }
    
    // 更新密码
    await UserModel.update(userId, { password: newPassword });
    
    res.json({
      success: true,
      message: '密码修改成功'
    });
    
    logger.info(`用户密码修改成功: ID ${userId}`);
  } catch (error) {
    logger.error(`修改密码失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '修改密码失败，请稍后重试'
    });
  }
}

/**
 * 更新用户个人信息
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function updateProfile(req, res) {
  try {
    const userId = req.session.userId;
    const { username, email } = req.body;
    
    // 获取用户信息
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 更新用户信息
    const updatedUser = await UserModel.update(userId, { username, email });
    
    // 更新会话中的用户名
    if (username) {
      req.session.username = username;
    }
    
    res.json({
      success: true,
      message: '个人信息更新成功',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        is_admin: updatedUser.is_admin === 1,
        created_at: updatedUser.created_at
      }
    });
    
    logger.info(`用户信息更新成功: ID ${userId}`);
  } catch (error) {
    logger.error(`更新个人信息失败: ${error.message}`);
    
    // 处理常见错误
    if (error.message.includes('已被注册') || error.message.includes('已被使用')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: '更新个人信息失败，请稍后重试'
    });
  }
}

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus,
  changePassword,
  updateProfile
}; 