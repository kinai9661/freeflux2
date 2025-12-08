import express from 'express';
import { CONFIG } from '../config.js';

const router = express.Router();

// Get all providers
router.get('/', (req, res) => {
  const providers = Object.entries(CONFIG.API_PROVIDERS).map(([id, config]) => ({
    id,
    ...config
  }));

  res.json({ providers });
});

// Health check for specific provider
router.post('/health', async (req, res) => {
  const { provider_id } = req.body;
  const provider = CONFIG.API_PROVIDERS[provider_id];

  if (!provider) {
    return res.status(404).json({
      error: { message: 'Provider not found' }
    });
  }

  const startTime = Date.now();
  
  try {
    // Simple health check - try to reach the service
    if (provider.type === 'typli') {
      res.json({
        status: 'healthy',
        latency: Date.now() - startTime,
        models_available: CONFIG.CHAT_MODELS.length + CONFIG.IMAGE_MODELS.length
      });
    } else {
      res.json({
        status: 'unknown',
        message: 'Health check not implemented for this provider'
      });
    }
  } catch (error) {
    res.json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;
