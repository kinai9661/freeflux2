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
      console.error('[Chat] Stream error:', streamError);
      res.end();
    }

  } catch (error) {
    console.error('[Chat] Error:', error);
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
  
  try {
    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('No messages provided');
    }

    const prompt = messages[messages.length - 1].content;
    
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt: must be a non-empty string');
    }

    console.log('[Image Gen] Starting:', { model, promptLength: prompt.length });

    // Try the simplest possible payload
    const payload = {
      prompt: prompt,
      modelId: model || CONFIG.DEFAULT_IMAGE_MODEL
    };

    console.log('[Image Gen] Payload created:', { 
      promptLength: payload.prompt.length,
      model: payload.modelId
    });

    // Make request to Typli
    console.log('[Image Gen] Sending to:', CONFIG.UPSTREAM_IMAGE_URL);

    const response = await fetch(CONFIG.UPSTREAM_IMAGE_URL, {
      method: "POST",
      headers: {
        ...CONFIG.BASE_HEADERS,
        "referer": CONFIG.REFERER_IMAGE_URL,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload),
      timeout: 30000 // 30 second timeout
    });

    console.log('[Image Gen] Response received:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type')
    });

    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text().catch(() => '(unable to read error body)');
      const errorMsg = `Typli returned ${response.status}: ${errorText.substring(0, 200)}`;
      console.error('[Image Gen] Server error:', errorMsg);
      throw new Error(errorMsg);
    }

    // Parse response
    const contentType = response.headers.get('content-type') || '';
    let imageUrl = null;

    console.log('[Image Gen] Content-Type:', contentType);

    try {
      if (contentType.includes('application/json')) {
        const result = await response.json();
        console.log('[Image Gen] JSON response received');
        imageUrl = extractImageUrl(result);
      } else if (contentType.includes('text/event-stream')) {
        console.log('[Image Gen] SSE response detected');
        imageUrl = await parseSSEResponse(response);
      } else {
        const text = await response.text();
        console.log('[Image Gen] Text response:', text.substring(0, 100));
        // Try to extract URL from plain text
        const urlMatch = text.match(/https?:\/\/[^\s"'<>\)\]]+/);
        if (urlMatch) {
          imageUrl = urlMatch[0];
        }
      }
    } catch (parseError) {
      console.error('[Image Gen] Failed to parse response:', parseError);
      throw new Error(`Failed to parse response: ${parseError.message}`);
    }

    if (!imageUrl) {
      throw new Error('No valid image URL found in response');
    }

    console.log('[Image Gen] Success! URL length:', imageUrl.length);

    // Return as SSE stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const requestId = generateRandomId(12);
    const markdown = `![${prompt.substring(0, 50)}...](${imageUrl})`;
    
    const chunk = createChatCompletionChunk(requestId, model, markdown, "stop");
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('[Image Gen] Fatal error:', error.message);
    console.error('[Image Gen] Stack:', error.stack);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: { 
          message: error.message, 
          type: 'image_generation_error',
          timestamp: new Date().toISOString()
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
  let lineCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        lineCount++;
        const dataStr = line.slice(6).trim();
        if (dataStr === '[DONE]') {
          console.log('[SSE] Received [DONE]');
          continue;
        }

        try {
          lastData = JSON.parse(dataStr);
          const url = extractImageUrl(lastData);
          if (url) {
            console.log('[SSE] Found URL in line', lineCount);
            return url;
          }
        } catch (e) {
          console.warn('[SSE] Parse error on line', lineCount, ':', e.message);
        }
      }
    }
  }

  console.log('[SSE] Processed', lineCount, 'lines, final data:', lastData);
  return extractImageUrl(lastData);
}

// Helper: Extract image URL from various response formats
function extractImageUrl(data) {
  if (!data) return null;
  
  // String response
  if (typeof data === 'string') {
    const match = data.match(/https?:\/\/[^\s"'<>\)\]]+/);
    return match ? match[0] : null;
  }

  // Direct URL fields
  if (data.url && typeof data.url === 'string') return data.url;
  if (data.image_url && typeof data.image_url === 'string') return data.image_url;
  if (data.imageUrl && typeof data.imageUrl === 'string') return data.imageUrl;
  
  // Array of images
  if (Array.isArray(data.images) && data.images.length > 0) {
    const first = data.images[0];
    if (typeof first === 'string') return first;
    if (first.url && typeof first.url === 'string') return first.url;
  }

  // Nested objects
  if (data.output && typeof data.output === 'object') {
    if (data.output.url && typeof data.output.url === 'string') return data.output.url;
  }
  if (data.data && typeof data.data === 'object') {
    if (data.data.url && typeof data.data.url === 'string') return data.data.url;
  }
  if (data.result && typeof data.result === 'object') {
    if (data.result.url && typeof data.result.url === 'string') return data.result.url;
  }

  // Try to find URL in any string field
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.includes('http')) {
      const match = value.match(/https?:\/\/[^\s"'<>\)\]]+/);
      if (match) return match[0];
    }
  }

  return null;
}

export default router;