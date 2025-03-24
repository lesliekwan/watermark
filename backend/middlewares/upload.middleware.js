/**
 * 文件上传中间件
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { UPLOAD_PATH, MAX_FILE_SIZE, ALLOWED_VIDEO_TYPES, ALLOWED_IMAGE_TYPES } = require('../config/app.config');
const { createLogger } = require('../utils/logger');

const logger = createLogger('upload-middleware');

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), UPLOAD_PATH);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 视频上传目录
const videoDir = path.join(uploadDir, 'videos');
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

// 图片上传目录
const imageDir = path.join(uploadDir, 'images');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// 配置视频存储
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// 配置图片存储
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// 文件过滤器
const videoFilter = (req, file, cb) => {
  if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn(`尝试上传不支持的视频类型: ${file.mimetype}`);
    cb(new Error('只允许上传MP4, MOV或MPEG格式的视频文件'), false);
  }
};

const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn(`尝试上传不支持的图片类型: ${file.mimetype}`);
    cb(new Error('只允许上传JPEG, PNG或GIF格式的图片文件'), false);
  }
};

// 创建上传中间件
const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// 错误处理
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error(`Multer上传错误: ${err.message}`);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: {
          message: '文件大小超过限制',
          code: 'FILE_TOO_LARGE'
        }
      });
    }
    
    return res.status(400).json({
      success: false,
      error: {
        message: '文件上传失败',
        code: 'UPLOAD_ERROR'
      }
    });
  }
  
  if (err) {
    logger.error(`上传中间件错误: ${err.message}`);
    return res.status(400).json({
      success: false,
      error: {
        message: err.message,
        code: 'UPLOAD_ERROR'
      }
    });
  }
  
  next();
};

module.exports = {
  videoUpload,
  imageUpload,
  handleUploadError
}; 