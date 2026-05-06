import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { rawInput, categorySlug, tone } = await req.json()

    if (!rawInput) {
      return new Response('rawInput is required', { status: 400, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { db: { schema: 'gennyoon' } }
    )

    let systemPrompt = DEFAULT_SYSTEM_PROMPT

    if (categorySlug) {
      const { data } = await supabase
        .from('ai_prompts')
        .select('system_prompt')
        .eq('category_slug', categorySlug)
        .single()
      if (data?.system_prompt) systemPrompt = data.system_prompt
    }

    const toneMap: Record<string, string> = {
      friendly: '친근하고 유머러스한 톤으로',
      professional: '전문적이고 신뢰감 있는 톤으로',
      story: '스토리텔링 방식으로',
    }
    const toneInstruction = toneMap[tone] || toneMap.friendly

    const res = await fetch('https://api.z.ai/api/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('GLM_API_KEY')!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `다음 재료로 블로그 글을 ${toneInstruction} 작성해줘:\n\n${rawInput}`,
        }],
        max_tokens: 4096,
        stream: true,
      }),
    })

    if (!res.ok) {
      return new Response('GLM API error', { status: 502, headers: corsHeaders })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            for (const line of chunk.split('\n')) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue

              try {
                const json = JSON.parse(data)
                if (json.type === 'content_block_delta' && json.delta?.text) {
                  controller.enqueue(encoder.encode(json.delta.text))
                }
              } catch { /* skip */ }
            }
          }
        } finally {
          controller.close()
          reader.releaseLock()
        }
      },
    })

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    console.error(err)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})
