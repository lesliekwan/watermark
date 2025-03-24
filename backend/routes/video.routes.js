/**
 * 视频路由
 */
const express = require('express');
const { uploadVideo, getUserVideos, getVideoById, updateVideo, deleteVideo, 
  addTextWatermark, addImageWatermark, addVideoWatermark, applyFilter, adjustSpeed } = require('../controllers/video.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const { videoUpload, imageUpload, handleUploadError } = require('../middlewares/upload.middleware');
const { videoUploadValidation, validate } = require('../utils/validator');

const router = express.Router();

// 上传视频
router.post('/', isAuthenticated, videoUpload.single('video'), handleUploadError, videoUploadValidation, validate, uploadVideo);

// 获取用户的视频列表
router.get('/my-videos', isAuthenticated, getUserVideos);

// 获取视频详情
router.get('/:id', isAuthenticated, getVideoById);

// 更新视频信息
router.put('/:id', isAuthenticated, updateVideo);

// 删除视频
router.delete('/:id', isAuthenticated, deleteVideo);

// 添加文字水印
router.post('/:id/watermark/text', isAuthenticated, addTextWatermark);

// 添加图片水印
router.post('/:id/watermark/image', isAuthenticated, imageUpload.single('image'), handleUploadError, addImageWatermark);

// 添加视频水印
router.post('/:id/watermark/video', isAuthenticated, addVideoWatermark);

// 应用滤镜
router.post('/:id/filter', isAuthenticated, applyFilter);

// 调整视频速度
router.post('/:id/speed', isAuthenticated, adjustSpeed);

module.exports = router; 