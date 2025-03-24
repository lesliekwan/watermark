/**
 * 数据验证工具
 */
const { check, validationResult } = require('express-validator');
const { createLogger } = require('./logger');

const logger = createLogger('validator');

/**
 * 用户注册验证规则
 */
const registerValidation = [
  check('username')
    .trim()
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度应在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线'),
  
  check('email')
    .trim()
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('请输入有效的邮箱地址'),
  
  check('password')
    .trim()
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6 }).withMessage('密码长度至少为6个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('密码必须包含大小写字母和数字')
];

/**
 * 用户登录验证规则
 */
const loginValidation = [
  check('email')
    .trim()
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('请输入有效的邮箱地址'),
  
  check('password')
    .trim()
    .notEmpty().withMessage('密码不能为空')
];

/**
 * 视频上传验证规则
 */
const videoUploadValidation = [
  check('title')
    .trim()
    .notEmpty().withMessage('视频标题不能为空')
    .isLength({ max: 100 }).withMessage('视频标题不能超过100个字符')
];

/**
 * 模板创建验证规则
 */
const templateValidation = [
  check('name')
    .trim()
    .notEmpty().withMessage('模板名称不能为空')
    .isLength({ max: 50 }).withMessage('模板名称不能超过50个字符'),
  
  check('config')
    .notEmpty().withMessage('模板配置不能为空')
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('模板配置必须是有效的JSON格式');
      }
    })
];

/**
 * 验证请求
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 * @param {Function} next 下一个中间件
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`请求验证失败: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
    });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  videoUploadValidation,
  templateValidation,
  validate
}; 