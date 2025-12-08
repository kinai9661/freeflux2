import { CONFIG } from '../config.js';

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  const apiKey = CONFIG.API_MASTER_KEY;

  // If API key is "1", allow all requests (open mode)
  if (apiKey === "1") {
    return next();
  }

  // Check for Bearer token
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        message: 'Missing or invalid Authorization header',
        type: 'auth_error',
        code: 'unauthorized'
      }
    });
  }

  const token = auth.slice(7);
  if (token !== apiKey) {
    return res.status(401).json({
      error: {
        message: 'Invalid API key',
        type: 'auth_error',
        code: 'invalid_api_key'
      }
    });
  }

  next();
}
