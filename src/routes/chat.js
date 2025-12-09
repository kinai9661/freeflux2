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

// Image generation handler - Simplified minimal approach
async function handleImageGeneration(req, res) {
  const { model, messages } = req.body;
  const prompt = messages[messages.length - 1].content;

  console.log('[Image Gen] Request:', { model, prompt });

  try {
    // Try the simplest possible payload first
    const payload = {
      prompt: prompt,
      modelId: model || CONFIG.DEFAULT_IMAGE_MODEL
    };

    console.log('[Image Gen] Payload:', JSON.stringify(payload));

    const response = await fetch(CONFIG.UPSTREAM_IMAGE_URL, {
      method: "POST",
      headers: {
        ...CONFIG.BASE_HEADERS,
        "referer": CONFIG.REFERER_IMAGE_URL,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log('[Image Gen] Response status:', response.status);
    console.log('[Image Gen] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Image Gen] Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Try to parse response
    const contentType = response.headers.get('content-type') || '';
    let result;

    if (contentType.includes('application/json')) {
      result = await response.json();
      console.log('[Image Gen] JSON response:', result);
    } else if (contentType.includes('text/event-stream')) {
      // Handle SSE
      console.log('[Image Gen] SSE response detected');
      result = await parseSSEResponse(response);
    } else {
      const text = await response.text();
      console.log('[Image Gen] Text response:', text);
      throw new Error('Unexpected response format: ' + contentType);
    }

    // Extract image URL
    const imageUrl = extractImageUrl(result);
    
    if (!imageUrl) {
      console.error('[Image Gen] No URL found in:', result);
      throw new Error('No image URL in response');
    }

    console.log('[Image Gen] Success! URL:', imageUrl);

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
    console.error('[Image Gen] Error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: { 
          message: error.message, 
          type: 'image_generation_error'
        }
      });
    } else {
      res.end();
    }
  }
}

// Helper: Parse SSE response
async function parseSSEResponse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let lastData = null;

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
          lastData = JSON.parse(dataStr);
          console.log('[SSE] Parsed:', lastData);
        } catch (e) {
          console.warn('[SSE] Parse error:', e);
        }
      }
    }
  }

  return lastData;
}

// Helper: Extract image URL from various response formats
function extractImageUrl(data) {
  if (!data) return null;
  
  // Try different possible fields
  if (typeof data === 'string') return data.match(/https?:\/\/[^\s]+/)?.[0];
  if (data.url) return data.url;
  if (data.image_url) return data.image_url;
  if (data.imageUrl) return data.imageUrl;
  if (data.images && data.images[0]) {
    return typeof data.images[0] === 'string' ? data.images[0] : data.images[0].url;
  }
  if (data.output && data.output.url) return data.output.url;
  if (data.data && data.data.url) return data.data.url;
  if (data.result && data.result.url) return data.result.url;
  
  return null;
}

export default router;