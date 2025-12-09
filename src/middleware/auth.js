import { CONFIG } from '../config.js';

/**
 * 验证 API 密钥
 * @param {string} providedKey - 客户端提供的密钥
 * @returns {boolean} 是否有效
 */
function validateApiKey(providedKey) {
  const masterKey = CONFIG.API_MASTER_KEY;
  
  // 如果主密钥是 "1"，开放模式（兼容旧版）
  if (masterKey === "1") {
    return true;
  }
  
  // 支持多个密钥，用逗号分隔
  const validKeys = masterKey.split(',').map(k => k.trim());
  return validKeys.includes(providedKey);
}

/**
 * API 认证中间件
 */
export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  const apiKey = CONFIG.API_MASTER_KEY;

  // 开放模式检查
  if (apiKey === "1") {
    console.log('⚠️  警告: API 运行在开放模式，建议设置 API_MASTER_KEY 环境变量');
    return next();
  }

  // 检查 Authorization 头
  if (!auth) {
    return res.status(401).json({
      error: {
        message: 'Missing Authorization header. Please provide: Authorization: Bearer YOUR_API_KEY',
        type: 'auth_error',
        code: 'unauthorized'
      }
    });
  }

  // 检查 Bearer 格式
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        message: 'Invalid Authorization header format. Expected: Bearer YOUR_API_KEY',
        type: 'auth_error',
        code: 'invalid_auth_format'
      }
    });
  }

  // 提取并验证 token
  const token = auth.slice(7).trim();
  
  if (!token) {
    return res.status(401).json({
      error: {
        message: 'Empty API key provided',
        type: 'auth_error',
        code: 'empty_api_key'
      }
    });
  }

  if (!validateApiKey(token)) {
    console.log(`🔒 认证失败: 无效的 API 密钥 (${token.substring(0, 8)}...)`);
    return res.status(401).json({
      error: {
        message: 'Invalid API key. Please check your API_MASTER_KEY configuration.',
        type: 'auth_error',
        code: 'invalid_api_key'
      }
    });
  }

  // 认证成功
  console.log(`✅ 认证成功: ${req.method} ${req.path}`);
  next();
}

/**
 * 生成随机 API 密钥（用于管理）
 */
export function generateApiKey(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'sk-';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
