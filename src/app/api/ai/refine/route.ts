import { generateText } from 'ai'
import { glm, GLM_MODELS } from '@/lib/glm'

const ACTION_PROMPTS: Record<string, string> = {
  rewrite: '같은 내용을 다른 표현으로 다시 써줘. 원문보다 자연스럽게.',
  funnier: '더 재미있고 생동감 있게 써줘. 약간의 유머를 섞어도 좋아.',
  shorter: '핵심만 남기고 절반으로 줄여줘. 중요한 내용은 빠지면 안 돼.',
  professional: '더 전문적이고 신뢰감 있는 톤으로 바꿔줘.',
}

export async function POST(request: Request) {
  try {
    const { paragraph, action } = await request.json()

    if (!paragraph || !action) {
      return new Response('paragraph and action are required', { status: 400 })
    }

    const prompt = ACTION_PROMPTS[action]
    if (!prompt) {
      return new Response('Invalid action', { status: 400 })
    }

    const { text } = await generateText({
      model: glm(GLM_MODELS.default),
      messages: [
        {
          role: 'user',
          content: `다음 단락을 ${prompt}\n\n---\n${paragraph}\n---\n\n수정된 단락만 출력해줘.`,
        },
      ],
    })

    return Response.json({ result: text })
  } catch (error) {
    console.error('AI refine error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
