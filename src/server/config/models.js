// Poe API Model Definitions (October 2025)
const POE_MODELS = {
  'Claude-Sonnet-4.5': {
    name: 'Claude-Sonnet-4.5',
    provider: 'Anthropic',
    description: 'Best for document parsing and structured data extraction',
    maxTokens: 8192,
    supportsVision: true,
    supportsFunctions: true,
    default: true
  },
  'GPT-5': {
    name: 'GPT-5',
    provider: 'OpenAI',
    description: 'Advanced reasoning and complex task completion',
    maxTokens: 8192,
    supportsVision: true,
    supportsFunctions: true
  },
  'GPT-5-Mini': {
    name: 'GPT-5-Mini',
    provider: 'OpenAI',
    description: 'Fast and efficient for simple tasks',
    maxTokens: 4096,
    supportsVision: false,
    supportsFunctions: true
  },
  'Gemini-2.5-Pro': {
    name: 'Gemini-2.5-Pro',
    provider: 'Google',
    description: 'Excellent for multimodal analysis',
    maxTokens: 8192,
    supportsVision: true,
    supportsFunctions: true
  },
  'Claude-Opus-4': {
    name: 'Claude-Opus-4',
    provider: 'Anthropic',
    description: 'Most capable model for complex reasoning',
    maxTokens: 4096,
    supportsVision: true,
    supportsFunctions: true
  },
  'Llama-3.3-70B': {
    name: 'Llama-3.3-70B',
    provider: 'Meta',
    description: 'Open-source alternative',
    maxTokens: 4096,
    supportsVision: false,
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
