/**
 * FFmpeg视频处理工具
 */
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { FFMPEG_PATH, UPLOAD_PATH } = require('../config/app.config');
const { createLogger } = require('./logger');

// 设置ffmpeg路径
ffmpeg.setFfmpegPath(FFMPEG_PATH);

const logger = createLogger('ffmpeg');

/**
 * 生成视频缩略图
 * @param {string} videoPath 视频文件路径
 * @returns {Promise<string>} 缩略图路径
 */
function generateThumbnail(videoPath) {
  return new Promise((resolve, reject) => {
    const thumbnailDir = path.join(process.cwd(), UPLOAD_PATH, 'thumbnails');
    
    // 确保缩略图目录存在
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    
    const thumbnailName = `${path.parse(videoPath).name}-${uuidv4()}.jpg`;
    const thumbnailPath = path.join(thumbnailDir, thumbnailName);
    
    ffmpeg(videoPath)
      .on('error', (err) => {
        logger.error(`生成缩略图失败: ${err.message}`);
        reject(err);
      })
      .on('end', () => {
        logger.info(`生成缩略图成功: ${thumbnailPath}`);
        resolve(path.join('thumbnails', thumbnailName));
      })
      .screenshots({
        count: 1,
        folder: thumbnailDir,
        filename: thumbnailName,
        size: '320x240'
      });
  });
}

/**
 * 获取视频信息
 * @param {string} videoPath 视频文件路径
 * @returns {Promise<object>} 视频信息
 */
function getVideoInfo(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        logger.error(`获取视频信息失败: ${err.message}`);
        reject(err);
        return;
      }
      
      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
      
      const info = {
        duration: metadata.format.duration,
        size: metadata.format.size,
        bitrate: metadata.format.bit_rate,
        format: metadata.format.format_name,
        resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : null,
        fps: videoStream ? videoStream.r_frame_rate : null,
        videoCodec: videoStream ? videoStream.codec_name : null,
        audioCodec: audioStream ? audioStream.codec_name : null
      };
      
      logger.info(`获取视频信息成功: ${JSON.stringify(info)}`);
      resolve(info);
    });
  });
}

/**
 * 添加文字水印
 * @param {string} videoPath 视频文件路径
 * @param {object} options 水印选项
 * @returns {Promise<string>} 处理后的视频路径
 */
function addTextWatermark(videoPath, options) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(process.cwd(), UPLOAD_PATH, 'processed');
    
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputName = `${path.parse(videoPath).name}-watermark-${uuidv4()}.mp4`;
    const outputPath = path.join(outputDir, outputName);
    
    // 设置字体路径
    const fontPath = path.join(process.cwd(), 'assets', 'fonts', options.fontFamily || 'Arial.ttf');
    
    ffmpeg(videoPath)
      .outputOptions([
        `-vf drawtext=text='${options.text}':fontfile='${fontPath}':fontsize=${options.fontSize || 24}:fontcolor=${options.fontColor || 'white'}:x=${options.x || 10}:y=${options.y || 10}:alpha=${options.opacity || 1}`
      ])
      .on('start', (commandLine) => {
        logger.info(`开始添加文字水印: ${commandLine}`);
      })
      .on('progress', (progress) => {
        logger.debug(`处理进度: ${JSON.stringify(progress)}`);
      })
      .on('error', (err) => {
        logger.error(`添加文字水印失败: ${err.message}`);
        reject(err);
      })
      .on('end', () => {
        logger.info(`添加文字水印成功: ${outputPath}`);
        resolve(path.join('processed', outputName));
      })
      .save(outputPath);
  });
}

/**
 * 添加图片水印
 * @param {string} videoPath 视频文件路径
 * @param {object} options 水印选项
 * @returns {Promise<string>} 处理后的视频路径
 */
function addImageWatermark(videoPath, options) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(process.cwd(), UPLOAD_PATH, 'processed');
    
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputName = `${path.parse(videoPath).name}-watermark-${uuidv4()}.mp4`;
    const outputPath = path.join(outputDir, outputName);
    
    ffmpeg(videoPath)
      .input(options.imagePath)
      .complexFilter([
        `[1:v]scale=${options.width || 100}:${options.height || 100},` +
        `format=rgba,colorchannelmixer=a=${options.opacity || 1}[watermark];` +
        `[0:v][watermark]overlay=${options.x || 10}:${options.y || 10}`
      ])
      .on('start', (commandLine) => {
        logger.info(`开始添加图片水印: ${commandLine}`);
      })
      .on('progress', (progress) => {
        logger.debug(`处理进度: ${JSON.stringify(progress)}`);
      })
      .on('error', (err) => {
        logger.error(`添加图片水印失败: ${err.message}`);
        reject(err);
      })
      .on('end', () => {
        logger.info(`添加图片水印成功: ${outputPath}`);
        resolve(path.join('processed', outputName));
      })
      .save(outputPath);
  });
}

/**
 * 添加视频水印（画中画）
 * @param {string} videoPath 主视频文件路径
 * @param {object} options 水印选项
 * @returns {Promise<string>} 处理后的视频路径
 */
function addVideoWatermark(videoPath, options) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(process.cwd(), UPLOAD_PATH, 'processed');
    
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputName = `${path.parse(videoPath).name}-pip-${uuidv4()}.mp4`;
    const outputPath = path.join(outputDir, outputName);
    
    // 视频开始和结束时间
    const startTime = options.startTime || 0;
    const endTime = options.endTime;
    
    let command = ffmpeg(videoPath)
      .input(options.watermarkVideoPath);
    
    // 设置水印视频的时间范围
    if (startTime && endTime) {
      command = command.setStartTime(startTime)
                      .setDuration(endTime - startTime);
    }
    
    command.complexFilter([
        `[1:v]scale=${options.width || 200}:${options.height || 150}[pip];` +
        `[0:v][pip]overlay=${options.x || 10}:${options.y || 10}`
      ])
      .on('start', (commandLine) => {
        logger.info(`开始添加视频水印: ${commandLine}`);
      })
      .on('progress', (progress) => {
        logger.debug(`处理进度: ${JSON.stringify(progress)}`);
      })
      .on('error', (err) => {
        logger.error(`添加视频水印失败: ${err.message}`);
        reject(err);
      })
      .on('end', () => {
        logger.info(`添加视频水印成功: ${outputPath}`);
        resolve(path.join('processed', outputName));
      })
      .save(outputPath);
  });
}

/**
 * 应用滤镜效果
 * @param {string} videoPath 视频文件路径
 * @param {string} filterType 滤镜类型
 * @returns {Promise<string>} 处理后的视频路径
 */
function applyFilter(videoPath, filterType) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(process.cwd(), UPLOAD_PATH, 'processed');
    
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputName = `${path.parse(videoPath).name}-filter-${uuidv4()}.mp4`;
    const outputPath = path.join(outputDir, outputName);
    
    // 滤镜映射
    const filters = {
      sepia: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131',
      grayscale: 'colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3',
      vintage: 'curves=vintage,vignette',
      cool: 'colortemperature=7500',
      warm: 'colortemperature=4000',
      sharpen: 'unsharp=5:5:1:3:3:0.05',
      blur: 'boxblur=2:1'
    };
    
    const filterValue = filters[filterType] || filters.sepia;
    
    ffmpeg(videoPath)
      .videoFilters(filterValue)
      .on('start', (commandLine) => {
        logger.info(`开始应用滤镜: ${commandLine}`);
      })
      .on('progress', (progress) => {
        logger.debug(`处理进度: ${JSON.stringify(progress)}`);
      })
      .on('error', (err) => {
        logger.error(`应用滤镜失败: ${err.message}`);
        reject(err);
      })
      .on('end', () => {
        logger.info(`应用滤镜成功: ${outputPath}`);
        resolve(path.join('processed', outputName));
      })
      .save(outputPath);
  });
}

/**
 * 调整视频速度
 * @param {string} videoPath 视频文件路径
 * @param {number} speed 速度倍率
 * @returns {Promise<string>} 处理后的视频路径
 */
function adjustSpeed(videoPath, speed) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(process.cwd(), UPLOAD_PATH, 'processed');
    
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputName = `${path.parse(videoPath).name}-speed-${uuidv4()}.mp4`;
    const outputPath = path.join(outputDir, outputName);
    
    // 计算滤镜参数
    const tempo = 1.0 / speed;
    
    ffmpeg(videoPath)
      .videoFilters(`setpts=${tempo}*PTS`)
      .audioFilters(`atempo=${speed}`)
      .on('start', (commandLine) => {
        logger.info(`开始调整视频速度: ${commandLine}`);
      })
      .on('progress', (progress) => {
        logger.debug(`处理进度: ${JSON.stringify(progress)}`);
      })
      .on('error', (err) => {
        logger.error(`调整视频速度失败: ${err.message}`);
        reject(err);
      })
      .on('end', () => {
        logger.info(`调整视频速度成功: ${outputPath}`);
        resolve(path.join('processed', outputName));
      })
      .save(outputPath);
  });
}

/**
 * 添加转场动画
 * @param {Array<string>} videoPaths 视频文件路径数组
 * @param {string} transitionType 转场类型
 * @returns {Promise<string>} 处理后的视频路径
 */
function addTransition(videoPaths, transitionType) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(process.cwd(), UPLOAD_PATH, 'processed');
    
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputName = `transition-${uuidv4()}.mp4`;
    const outputPath = path.join(outputDir, outputName);
    
    // 转场类型映射
    const transitions = {
      fade: 'fade=t=in:st=0:d=1,fade=t=out:st=4:d=1',
      wipe: 'wipeleft',
      dissolve: 'dissolve',
      slide: 'slideright'
    };
    
    const transitionFilter = transitions[transitionType] || transitions.fade;
    
    // 创建一个复杂的过滤器链来处理视频之间的转场
    let command = ffmpeg();
    
    // 添加所有输入视频
    videoPaths.forEach(videoPath => {
      command = command.input(videoPath);
    });
    
    // 构建复杂的过滤器字符串
    let filterComplex = '';
    for (let i = 0; i < videoPaths.length; i++) {
      if (i < videoPaths.length - 1) {
        filterComplex += `[${i}:v][${i+1}:v]${transitionFilter}[v${i}];`;
      }
    }
    
    // 添加最后的输出标签
    filterComplex += `[v${videoPaths.length-2}]`;
    
    command.complexFilter(filterComplex)
      .on('start', (commandLine) => {
        logger.info(`开始添加转场: ${commandLine}`);
      })
      .on('progress', (progress) => {
        logger.debug(`处理进度: ${JSON.stringify(progress)}`);
      })
      .on('error', (err) => {
        logger.error(`添加转场失败: ${err.message}`);
        reject(err);
      })
      .on('end', () => {
        logger.info(`添加转场成功: ${outputPath}`);
        resolve(path.join('processed', outputName));
      })
      .save(outputPath);
  });
}

/**
 * 清理临时文件
 * @param {Array<string>} filePaths 文件路径数组
 */
function cleanupFiles(filePaths) {
  filePaths.forEach(filePath => {
    try {
      const fullPath = path.join(process.cwd(), UPLOAD_PATH, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        logger.info(`删除临时文件: ${fullPath}`);
      }
    } catch (error) {
      logger.error(`删除临时文件失败: ${error.message}`);
    }
  });
}

module.exports = {
  generateThumbnail,
  getVideoInfo,
  addTextWatermark,
  addImageWatermark,
  addVideoWatermark,
  applyFilter,
  adjustSpeed,
  addTransition,
  cleanupFiles
}; 