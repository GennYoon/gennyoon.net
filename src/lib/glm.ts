import { createOpenAI } from '@ai-sdk/openai'

export const glm = createOpenAI({
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  apiKey: process.env.GLM_API_KEY,
})

export const GLM_MODELS = {
  default: 'glm-4-flash',   // 빠른 응답 (단락 수정, 번역)
  powerful: 'glm-4-plus',   // 긴 글 초안 생성
}
