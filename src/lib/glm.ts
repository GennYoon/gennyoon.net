import { createOpenAI } from '@ai-sdk/openai'

export const glm = createOpenAI({
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  apiKey: process.env.GLM_API_KEY,
})

export const GLM_MODELS = {
  default: 'glm-5-turbo',  // 빠른 응답 (단락 수정, 번역)
  powerful: 'glm-5',       // 긴 글 초안 생성
}
