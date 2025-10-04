// Poe API Model Definitions (updated March 2026)
const POE_MODELS = {
  'Claude-Sonnet-4.5': {
    name: 'Claude-Sonnet-4.5',
    provider: 'Anthropic',
    description: 'Balanced default for high-quality chats and document parsing',
    maxTokens: 8192,
    supportsVision: true,
    supportsFunctions: true,
    default: true
  },
  'Claude-Opus-4.1': {
    name: 'Claude-Opus-4.1',
    provider: 'Anthropic',
    description: 'Highest capability Claude model for demanding workflows',
    maxTokens: 8192,
    supportsVision: true,
    supportsFunctions: true
  },
  'Claude-Sonnet-3.5': {
    name: 'Claude-Sonnet-3.5',
    provider: 'Anthropic',
    description: 'Reliable mid-tier assistant with strong instruction following',
    maxTokens: 8192,
    supportsVision: true,
    supportsFunctions: true
  },
  'Claude-Haiku-3.5': {
    name: 'Claude-Haiku-3.5',
    provider: 'Anthropic',
    description: 'Fast lightweight Claude suited for quick responses',
    maxTokens: 4096,
    supportsVision: true,
    supportsFunctions: true
  },
  'Claude-Opus-4-Reasoning': {
    name: 'Claude-Opus-4-Reasoning',
    provider: 'Anthropic',
    description: 'Enhanced reasoning-focused variant of Opus',
    maxTokens: 8192,
    supportsVision: true,
    supportsFunctions: true
  },
  'Claude-Sonnet-4-Reasoning': {
    name: 'Claude-Sonnet-4-Reasoning',
    provider: 'Anthropic',
    description: 'Reasoning-tuned Sonnet model for complex problem solving',
    maxTokens: 8192,
    supportsVision: true,
    supportsFunctions: true
  },
  'GPT-5': {
    name: 'GPT-5',
    provider: 'OpenAI',
    description: 'Advanced flagship GPT for nuanced reasoning and creation',
    maxTokens: 8192,
    supportsVision: true,
    supportsFunctions: true
  },
  'GPT-5-Mini': {
    name: 'GPT-5-Mini',
    provider: 'OpenAI',
    description: 'Faster GPT-5 variant balancing quality and latency',
    maxTokens: 8192,
    supportsVision: true,
    supportsFunctions: true
  },
  'GPT-5-Nano': {
    name: 'GPT-5-Nano',
    provider: 'OpenAI',
    description: 'Cost-efficient GPT-5 tuned for lightweight tasks',
    maxTokens: 4096,
    supportsVision: false,
    supportsFunctions: true
  },
  'GPT-G-Codex': {
    name: 'GPT-G-Codex',
    provider: 'OpenAI',
    description: 'Specialized GPT for code understanding and generation',
    maxTokens: 8192,
    supportsVision: false,
    supportsFunctions: true
  },
  'Gemini-2.5-Pro': {
    name: 'Gemini-2.5-Pro',
    provider: 'Google',
    description: 'Premium multimodal Gemini for rich content understanding',
    maxTokens: 8192,
    supportsVision: true,
    supportsFunctions: true
  },
  'Gemini-2.5-Flash': {
    name: 'Gemini-2.5-Flash',
    provider: 'Google',
    description: 'Latency-optimized Gemini with multimodal support',
    maxTokens: 4096,
    supportsVision: true,
    supportsFunctions: true
  },
  'Gemini-2.5-Flash-Lite': {
    name: 'Gemini-2.5-Flash-Lite',
    provider: 'Google',
    description: 'Cost-effective Gemini for rapid responses',
    maxTokens: 4096,
    supportsVision: true,
    supportsFunctions: true
  }
};

const DEFAULT_MODEL = 'Claude-Sonnet-4.5';

module.exports = {
  POE_MODELS,
  DEFAULT_MODEL,
  getModel: (modelName) => POE_MODELS[modelName] || POE_MODELS[DEFAULT_MODEL],
  listModels: () => Object.values(POE_MODELS)
};
