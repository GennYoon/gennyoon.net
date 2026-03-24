import { glmStream, GLM_MODELS } from '@/lib/glm'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_SYSTEM_PROMPT = `당신은 전직 CTO이자 AI 노마드인 GennYoon의 블로그 편집자입니다.
독자에게 말 걸듯 친근하고 솔직하게, 핵심만 간결하게 작성합니다.

출력 형식:
## 제목 후보
1. [제목1]
2. [제목2]
3. [제목3]

## 본문
[마크다운 본문]

## SEO
- description: [100자 이내]
- 태그: [tag1, tag2, tag3, tag4, tag5]`

export async function POST(request: Request) {
  try {
    const { rawInput, categorySlug, tone } = await request.json()

    if (!rawInput) {
      return new Response('rawInput is required', { status: 400 })
    }

    const supabase = await createClient()
    let systemPrompt = DEFAULT_SYSTEM_PROMPT

    if (categorySlug) {
      const { data } = await supabase
        .from('ai_prompts')
        .select('system_prompt')
        .eq('category_slug', categorySlug)
        .single()

      if (data?.system_prompt) {
        systemPrompt = data.system_prompt
      }
    }

    const toneMap: Record<string, string> = {
      friendly: '친근하고 유머러스한 톤으로',
      professional: '전문적이고 신뢰감 있는 톤으로',
      story: '스토리텔링 방식으로',
    }
    const toneInstruction = toneMap[tone] || toneMap.friendly

    const stream = await glmStream({
      model: GLM_MODELS.powerful,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `다음 재료로 블로그 글을 ${toneInstruction} 작성해줘:\n\n${rawInput}`,
        },
      ],
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('AI generate error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
