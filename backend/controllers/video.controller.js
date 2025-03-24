/**
 * 视频控制器
 */
const VideoModel = require('../models/video.model');
const ffmpegUtils = require('../utils/ffmpeg');
const path = require('path');
const fs = require('fs');
const { createLogger } = require('../utils/logger');

const logger = createLogger('video-controller');

/**
 * 上传视频
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function uploadVideo(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的视频文件'
      });
    }
    
    const userId = req.session.userId;
    const { title, description } = req.body;
    const filePath = path.join('videos', req.file.filename);
    
    // 创建视频记录
    const video = await VideoModel.create({
      user_id: userId,
      title,
      description,
      file_path: filePath
    });
    
    res.status(201).json({
      success: true,
      message: '视频上传成功',
      data: video
    });
    
    logger.info(`视频上传成功: ${title}, ID: ${video.id}, 用户: ${userId}`);
  } catch (error) {
    logger.error(`视频上传失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '视频上传失败，请稍后重试'
    });
  }
}

/**
 * 获取用户的视频列表
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function getUserVideos(req, res) {
  try {
    const userId = req.session.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // 获取视频列表
    const videos = await VideoModel.findByUserId(userId, limit, offset);
    
    // 获取视频总数
    const total = await VideoModel.countByUserId(userId);
    
    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error(`获取用户视频列表失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '获取视频列表失败，请稍后重试'
    });
  }
}

/**
 * 获取视频详情
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function getVideoById(req, res) {
  try {
    const videoId = parseInt(req.params.id);
    
    // 获取视频信息
    const video = await VideoModel.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: '视频不存在'
      });
    }
    
    // 检查访问权限
    const userId = req.session.userId;
    const isAdmin = req.session.isAdmin;
    
    if (video.user_id !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权访问此视频'
      });
    }
    
    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    logger.error(`获取视频详情失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '获取视频详情失败，请稍后重试'
    });
  }
}

/**
 * 更新视频信息
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function updateVideo(req, res) {
  try {
    const videoId = parseInt(req.params.id);
    const { title, description } = req.body;
    
    // 获取视频信息
    const video = await VideoModel.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: '视频不存在'
      });
    }
    
    // 检查权限
    const userId = req.session.userId;
    const isAdmin = req.session.isAdmin;
    
    if (video.user_id !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权修改此视频'
      });
    }
    
    // 更新视频信息
    const updatedVideo = await VideoModel.update(videoId, { title, description });
    
    res.json({
      success: true,
      message: '视频信息更新成功',
      data: updatedVideo
    });
    
    logger.info(`视频信息更新成功: ID ${videoId}, 用户: ${userId}`);
  } catch (error) {
    logger.error(`更新视频信息失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '更新视频信息失败，请稍后重试'
    });
  }
}

/**
 * 删除视频
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function deleteVideo(req, res) {
  try {
    const videoId = parseInt(req.params.id);
    
    // 获取视频信息
    const video = await VideoModel.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: '视频不存在'
      });
    }
    
    // 检查权限
    const userId = req.session.userId;
    const isAdmin = req.session.isAdmin;
    
    if (video.user_id !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权删除此视频'
      });
    }
    
    // 删除视频文件
    const videoPath = path.join(process.cwd(), 'uploads', video.file_path);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
    
    // 删除缩略图
    if (video.thumbnail_path) {
      const thumbnailPath = path.join(process.cwd(), 'uploads', video.thumbnail_path);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }
    
    // 删除视频记录
    await VideoModel.delete(videoId);
    
    res.json({
      success: true,
      message: '视频已删除'
    });
    
    logger.info(`视频删除成功: ID ${videoId}, 用户: ${userId}`);
  } catch (error) {
    logger.error(`删除视频失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '删除视频失败，请稍后重试'
    });
  }
}

/**
 * 添加文字水印
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function addTextWatermark(req, res) {
  try {
    const videoId = parseInt(req.params.id);
    const { text, fontSize, fontColor, x, y, opacity, fontFamily } = req.body;
    
    // 获取视频信息
    const video = await VideoModel.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: '视频不存在'
      });
    }
    
    // 检查权限
    const userId = req.session.userId;
    if (video.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权编辑此视频'
      });
    }
    
    // 添加水印
    const videoPath = path.join(process.cwd(), 'uploads', video.file_path);
    const outputPath = await ffmpegUtils.addTextWatermark(videoPath, {
      text,
      fontSize,
      fontColor,
      x,
      y,
      opacity,
      fontFamily
    });
    
    // 更新视频记录
    const updatedVideo = await VideoModel.update(videoId, { file_path: outputPath });
    
    res.json({
      success: true,
      message: '文字水印添加成功',
      data: updatedVideo
    });
    
    logger.info(`添加文字水印成功: 视频ID ${videoId}, 用户: ${userId}`);
  } catch (error) {
    logger.error(`添加文字水印失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '添加文字水印失败，请稍后重试'
    });
  }
}

/**
 * 添加图片水印
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function addImageWatermark(req, res) {
  try {
    const videoId = parseInt(req.params.id);
    const { x, y, width, height, opacity } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择水印图片'
      });
    }
    
    // 获取视频信息
    const video = await VideoModel.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: '视频不存在'
      });
    }
    
    // 检查权限
    const userId = req.session.userId;
    if (video.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权编辑此视频'
      });
    }
    
    // 添加水印
    const videoPath = path.join(process.cwd(), 'uploads', video.file_path);
    const imagePath = path.join(process.cwd(), 'uploads', 'images', req.file.filename);
    
    const outputPath = await ffmpegUtils.addImageWatermark(videoPath, {
      imagePath,
      x,
      y,
      width,
      height,
      opacity
    });
    
    // 更新视频记录
    const updatedVideo = await VideoModel.update(videoId, { file_path: outputPath });
    
    res.json({
      success: true,
      message: '图片水印添加成功',
      data: updatedVideo
    });
    
    logger.info(`添加图片水印成功: 视频ID ${videoId}, 用户: ${userId}`);
  } catch (error) {
    logger.error(`添加图片水印失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '添加图片水印失败，请稍后重试'
    });
  }
}

/**
 * 添加视频水印（画中画）
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function addVideoWatermark(req, res) {
  try {
    const videoId = parseInt(req.params.id);
    const watermarkVideoId = parseInt(req.body.watermarkVideoId);
    const { x, y, width, height, startTime, endTime } = req.body;
    
    // 获取视频信息
    const video = await VideoModel.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: '主视频不存在'
      });
    }
    
    // 获取水印视频信息
    const watermarkVideo = await VideoModel.findById(watermarkVideoId);
    if (!watermarkVideo) {
      return res.status(404).json({
        success: false,
        message: '水印视频不存在'
      });
    }
    
    // 检查权限
    const userId = req.session.userId;
    if (video.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权编辑此视频'
      });
    }
    
    // 添加视频水印
    const videoPath = path.join(process.cwd(), 'uploads', video.file_path);
    const watermarkVideoPath = path.join(process.cwd(), 'uploads', watermarkVideo.file_path);
    
    const outputPath = await ffmpegUtils.addVideoWatermark(videoPath, {
      watermarkVideoPath,
      x,
      y,
      width,
      height,
      startTime,
      endTime
    });
    
    // 更新视频记录
    const updatedVideo = await VideoModel.update(videoId, { file_path: outputPath });
    
    res.json({
      success: true,
      message: '视频水印添加成功',
      data: updatedVideo
    });
    
    logger.info(`添加视频水印成功: 视频ID ${videoId}, 用户: ${userId}`);
  } catch (error) {
    logger.error(`添加视频水印失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '添加视频水印失败，请稍后重试'
    });
  }
}

/**
 * 应用滤镜效果
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function applyFilter(req, res) {
  try {
    const videoId = parseInt(req.params.id);
    const { filterType } = req.body;
    
    // 获取视频信息
    const video = await VideoModel.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: '视频不存在'
      });
    }
    
    // 检查权限
    const userId = req.session.userId;
    if (video.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权编辑此视频'
      });
    }
    
    // 应用滤镜
    const videoPath = path.join(process.cwd(), 'uploads', video.file_path);
    const outputPath = await ffmpegUtils.applyFilter(videoPath, filterType);
    
    // 更新视频记录
    const updatedVideo = await VideoModel.update(videoId, { file_path: outputPath });
    
    res.json({
      success: true,
      message: '滤镜应用成功',
      data: updatedVideo
    });
    
    logger.info(`应用滤镜成功: 视频ID ${videoId}, 滤镜: ${filterType}, 用户: ${userId}`);
  } catch (error) {
    logger.error(`应用滤镜失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '应用滤镜失败，请稍后重试'
    });
  }
}

/**
 * 调整视频速度
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 */
async function adjustSpeed(req, res) {
  try {
    const videoId = parseInt(req.params.id);
    const { speed } = req.body;
    
    // 检查速度值
    const speedValue = parseFloat(speed);
    if (isNaN(speedValue) || speedValue <= 0 || speedValue > 5) {
      return res.status(400).json({
        success: false,
        message: '速度值无效，请使用0.1到5之间的数值'
      });
    }
    
    // 获取视频信息
    const video = await VideoModel.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: '视频不存在'
      });
    }
    
    // 检查权限
    const userId = req.session.userId;
    if (video.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权编辑此视频'
      });
    }
    
    // 调整速度
    const videoPath = path.join(process.cwd(), 'uploads', video.file_path);
    const outputPath = await ffmpegUtils.adjustSpeed(videoPath, speedValue);
    
    // 更新视频记录
    const updatedVideo = await VideoModel.update(videoId, { file_path: outputPath });
    
    res.json({
      success: true,
      message: '视频速度调整成功',
      data: updatedVideo
    });
    
    logger.info(`调整视频速度成功: 视频ID ${videoId}, 速度: ${speedValue}, 用户: ${userId}`);
  } catch (error) {
    logger.error(`调整视频速度失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '调整视频速度失败，请稍后重试'
    });
  }
}

module.exports = {
  uploadVideo,
  getUserVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  addTextWatermark,
  addImageWatermark,
  addVideoWatermark,
  applyFilter,
  adjustSpeed
}; 