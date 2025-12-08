export const CONFIG = {
  // Project metadata
  PROJECT_NAME: "typli-api-zeabur",
  PROJECT_VERSION: "2.2.0",

  // API key (from environment or default)
  API_MASTER_KEY: process.env.API_MASTER_KEY || "1",

  // Upstream services
  UPSTREAM_CHAT_URL: "https://typli.ai/api/generators/chat",
  UPSTREAM_IMAGE_URL: "https://typli.ai/api/generators/images",
  ORIGIN_URL: "https://typli.ai",
  REFERER_CHAT_URL: "https://typli.ai/free-no-sign-up-chatgpt",
  REFERER_IMAGE_URL: "https://typli.ai/ai-image-generator",

  // Chat models
  CHAT_MODELS: [
    "xai/grok-4-fast",
    "xai/grok-4-fast-reasoning",
    "anthropic/claude-haiku-4-5",
    "openai/gpt-5",
    "openai/gpt-5-mini",
    "openai/gpt-4o",
    "openai/gpt-4o-mini",
    "google/gemini-2.5-flash",
    "deepseek/deepseek-reasoner",
    "deepseek/deepseek-chat",
    "grok-4",
    "gpt-4o",
    "gpt-3.5-turbo"
  ],

  // Image models
  IMAGE_MODELS: [
    "fal-ai/flux-2",
    "fal-ai/flux-2-pro",
    "fal-ai/flux-2-dev",
    "fal-ai/flux-2-lora-gallery/realism",
    "fal-ai/nano-banana",
    "fal-ai/nano-banana-pro",
    "fal-ai/stable-diffusion-v35-large",
    "fal-ai/recraft/v3/text-to-image",
    "imagineart/imagineart-1.5-preview/text-to-image",
    "fal-ai/bytedance/seedream/v4.5/text-to-image"
  ],

  DEFAULT_CHAT_MODEL: "xai/grok-4-fast",
  DEFAULT_IMAGE_MODEL: "fal-ai/flux-2",

  // Browser fingerprint headers
  BASE_HEADERS: {
    "authority": "typli.ai",
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "content-type": "application/json",
    "origin": "https://typli.ai",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
    "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "priority": "u=1, i"
  },

  // Multi-provider support
  API_PROVIDERS: {
    TYPLI: {
      name: "Typli Free",
      type: "typli",
      enabled: true,
      requires_key: false
    },
    OPENAI: {
      name: "OpenAI Official",
      type: "openai",
      enabled: !!process.env.OPENAI_API_KEY,
      base_url: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      requires_key: true
    },
    OLLAMA: {
      name: "Ollama Local",
      type: "openai-compatible",
      enabled: !!process.env.OLLAMA_BASE_URL,
      base_url: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
      requires_key: false
    }
  }
};
