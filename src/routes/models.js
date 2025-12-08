import express from 'express';
import { CONFIG } from '../config.js';

const router = express.Router();

router.get('/', (req, res) => {
  const allModels = [...CONFIG.CHAT_MODELS, ...CONFIG.IMAGE_MODELS];
  
  const modelsData = {
    object: 'list',
    data: allModels.map(id => ({
      id: id,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: 'typli-api',
      type: CONFIG.IMAGE_MODELS.includes(id) ? 'image' : 'chat'
    }))
  };

  res.json(modelsData);
});

export default router;
