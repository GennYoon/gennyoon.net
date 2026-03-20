import { generateText } from 'ai'
import { glm, GLM_MODELS } from '@/lib/glm'

export async function POST(request: Request) {
  try {
    const { content, title } = await request.json()

    if (!content || !title) {
      return new Response('content and title are required', { status: 400 })
    }

    const { text } = await generateText({
      model: glm(GLM_MODELS.powerful),
      messages: [
        {
          role: 'user',
          content: `이 한국어 블로그 글을 영어권 개발자 독자에게 맞게 자연스러운 영어로 번역해줘.
한국 고유 맥락(예: 카카오, 네이버 등)은 괄호로 영어 설명 추가.
제목도 번역해줘.
형식: { "title": "...", "content": "..." } JSON으로만 응답

제목: ${title}

내용:
${content}`,
        },
      ],
    })

    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return Response.json(parsed)
  } catch (error) {
    console.error('AI translate error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
