import express from 'express';
import { CONFIG } from '../config.js';
import { generateRandomId, createChatCompletionChunk } from '../utils/helpers.js';

const router = express.Router();

// Chat completions endpoint
router.post('/completions', async (req, res) => {
  try {
    const { model, messages, stream = true } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: { message: 'Invalid messages format', type: 'invalid_request_error' }
      });
    }

    // Check if it's an image model
    const isImageModel = CONFIG.IMAGE_MODELS.includes(model);
    
    if (isImageModel) {
      return await handleImageGeneration(req, res);
    }

    // Handle chat models
    const sessionId = generateRandomId(16);
    const typliMessages = messages.map(msg => ({
      parts: [{ type: "text", text: msg.content }],
      id: generateRandomId(16),
      role: msg.role
    }));

    const payload = {
      slug: "free-no-sign-up-chatgpt",
      modelId: model || CONFIG.DEFAULT_CHAT_MODEL,
      id: sessionId,
      messages: typliMessages,
      trigger: "submit-message"
    };

    const response = await fetch(CONFIG.UPSTREAM_CHAT_URL, {
      method: "POST",
      headers: {
        ...CONFIG.BASE_HEADERS,
        "referer": CONFIG.REFERER_CHAT_URL
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Upstream error: ${response.status}`);
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const requestId = generateRandomId(12);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'text-delta' && data.delta) {
                const chunk = createChatCompletionChunk(requestId, model, data.delta);
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      // Send final chunk
      const endChunk = createChatCompletionChunk(requestId, model, null, "stop");
      res.write(`data: ${JSON.stringify(endChunk)}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();

    } catch (streamError) {
      console.error('Stream error:', streamError);
      res.end();
    }

  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: { message: error.message, type: 'api_error' }
      });
    } else {
      res.end();
    }
  }
});

// Image generation handler
async function handleImageGeneration(req, res) {
  const { model, messages } = req.body;
  const prompt = messages[messages.length - 1].content;

  console.log('Image generation request:', { model, prompt });

  try {
    // Generate session ID for image request
    const sessionId = generateRandomId(16);
    
    // Construct payload matching Typli's expected format
    const payload = {
      slug: "ai-image-generator",
      modelId: model || CONFIG.DEFAULT_IMAGE_MODEL,
      id: sessionId,
      prompt: prompt,
      trigger: "submit-prompt"
    };

    console.log('Sending payload to Typli:', JSON.stringify(payload));

    const response = await fetch(CONFIG.UPSTREAM_IMAGE_URL, {
      method: "POST",
      headers: {
        ...CONFIG.BASE_HEADERS,
        "referer": CONFIG.REFERER_IMAGE_URL
      },
      body: JSON.stringify(payload)
    });

    console.log('Typli response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Typli error response:', errorText);
      throw new Error(`Image generation failed: ${response.status} - ${errorText}`);
    }

    // Check response content type
    const contentType = response.headers.get('content-type') || '';
    console.log('Response content-type:', contentType);

    let imageUrl = null;

    if (contentType.includes('text/event-stream')) {
      // Handle SSE response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;

            try {
              const data = JSON.parse(dataStr);
              console.log('SSE data:', data);
              
              // Extract image URL from various possible response formats
              if (data.url) {
                imageUrl = data.url;
              } else if (data.image_url) {
                imageUrl = data.image_url;
              } else if (data.images && data.images[0]) {
                imageUrl = data.images[0].url || data.images[0];
              } else if (data.output && data.output.url) {
                imageUrl = data.output.url;
              } else if (data.type === 'image-url' && data.content) {
                imageUrl = data.content;
              }

              if (imageUrl) break;
            } catch (e) {
              console.warn('Failed to parse SSE line:', e);
            }
          }
        }

        if (imageUrl) break;
      }
    } else {
      // Handle JSON response
      const result = await response.json();
      console.log('JSON response:', result);
      
      // Extract URL from various possible formats
      if (result.url) {
        imageUrl = result.url;
      } else if (result.image_url) {
        imageUrl = result.image_url;
      } else if (result.images && result.images[0]) {
        imageUrl = result.images[0].url || result.images[0];
      } else if (result.output && result.output.url) {
        imageUrl = result.output.url;
      } else if (result.data && result.data.url) {
        imageUrl = result.data.url;
      }
    }

    if (!imageUrl) {
      throw new Error('No image URL found in response');
    }

    console.log('Extracted image URL:', imageUrl);

    // Return as SSE stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const requestId = generateRandomId(12);
    const markdown = `![${prompt}](${imageUrl})`;
    
    const chunk = createChatCompletionChunk(requestId, model, markdown, "stop");
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Image generation error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: { 
          message: error.message, 
          type: 'image_generation_error',
          details: error.stack
        }
      });
    } else {
      res.end();
    }
  }
}

export default router;