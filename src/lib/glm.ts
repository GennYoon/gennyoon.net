import { createAnthropic } from '@ai-sdk/anthropic'

export const glm = createAnthropic({
  baseURL: 'https://api.z.ai/api/anthropic',
  apiKey: process.env.GLM_API_KEY,
})

export const GLM_MODELS = {
  default: 'claude-3-5-haiku-20241022',  // 빠른 응답 (단락 수정, 번역) → glm-4.5-air
  powerful: 'claude-sonnet-4-5',         // 긴 글 초안 생성 → glm-4.7
}
