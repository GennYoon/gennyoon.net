import { generateText } from 'ai'
import { glm, GLM_MODELS } from '@/lib/glm'

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json()

    if (!title || !content) {
      return new Response('title and content are required', { status: 400 })
    }

    const { text } = await generateText({
      model: glm(GLM_MODELS.default),
      messages: [
        {
          role: 'user',
          content: `다음 블로그 글의 SEO 메타데이터를 생성해줘.
반드시 아래 JSON 형식으로만 응답해. 코드 블록 없이 순수 JSON만.

{
  "seoTitle": "60자 이내 SEO 제목",
  "seoDescription": "160자 이내 SEO 설명",
  "ogTitle": "OG 제목",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

제목: ${title}

내용 요약:
${content.slice(0, 1000)}`,
        },
      ],
    })

    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return Response.json(parsed)
  } catch (error) {
    console.error('AI SEO error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
