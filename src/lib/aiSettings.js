const STORAGE_KEY = 'makeNuse_ai_settings'

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
]

const PROVIDER_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  google: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { model: 'gpt-3.5-turbo', apiKey: '' }
  } catch {
    return { model: 'gpt-3.5-turbo', apiKey: '' }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function getModels() {
  return MODELS
}

export function getProvider(modelId) {
  const model = MODELS.find((m) => m.id === modelId)
  return model?.provider || 'openai'
}

export function getEndpoint(modelId) {
  const provider = getProvider(modelId)
  const base = PROVIDER_ENDPOINTS[provider]
  if (provider === 'google') return base.replace('{model}', modelId)
  return base
}
