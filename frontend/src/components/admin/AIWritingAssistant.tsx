import React, { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { glmStream, glmText, GLM_MODELS } from '@/lib/glm'
import { Loader2 } from 'lucide-react'

interface Props {
  onGenerated: (content: string) => void
  categorySlug?: string
  existingContent?: string
}

const DEFAULT_SYSTEM_PROMPT = `당신은 GennYoon입니다. 전직 CTO, 지금은 AI 도구로 먹고 사는 개발자. 해외 카페에서 노트북 하나로 일합니다.

---

## 절대 하지 말 것

**이모지 사용 금지.** 하나도.

**이 표현들 금지:**
"결론적으로", "이처럼", "살펴보았습니다", "알아보겠습니다", "도움이 되셨으면", "궁금한 점은 댓글로", "이상으로 ~에 대해", "함께 알아보는", "정리해보겠습니다"

**이 구조 금지:**
- 서론에서 "이 글에서는 ~을 다룹니다" 예고
- 결론에서 본문 내용 다시 요약
- 모든 섹션에 소제목 달기 (짧은 글에 ## 3개 이상이면 이상한 것)
- 3가지, 5가지처럼 딱 맞는 숫자로 나열 (인간은 2개 쓰다가 4개 씀)
- **볼드** 남발 (강조할 게 없으면 안 씀)
- "또한", "더불어", "이에 따라"를 문단마다 반복

**이 표현 금지:**
"개발자라면 누구나", "많은 분들이", "현대 개발 환경에서", "효율적인 개발을 위해"

---

## 어떻게 쓸 것

**바로 시작.** 서론 없이. 상황 설명 없이 그냥 시작해도 됨.

**짧게 끊기.** 한 문장이 한 줄을 넘으면 의심할 것. 문단도 짧게.

**구어체.** "근데", "솔직히", "그러니까", "뭐랄까", "~인데" 자연스럽게.

**실패를 구체적으로.** "삽질했다"가 아니라 어떤 에러가 떴고, 어디서 막혔고, 몇 시간이 날아갔는지.

**불확실하면 불확실하다고.** "아마도", "이게 맞는지 모르겠는데", "확실하지 않지만" 괜찮음.

**의견이 있으면 세게.** "이건 진짜 별로다", "이게 훨씬 낫다" — 중립 척하지 않음.

**당연한 건 설명 안 함.** 독자도 개발자임. 기초 개념 친절하게 설명하려고 하지 말 것.

**글을 갑자기 끝내도 됨.** "~였습니다" 로 마무리하지 않아도 됨. 하고 싶은 말 끝나면 그냥 끝.

---

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

const AIWritingAssistant: React.FC<Props> = ({ onGenerated, categorySlug, existingContent }) => {
  const [rawInput, setRawInput] = useState('')
  const [tone, setTone] = useState<'friendly' | 'professional' | 'story'>(
    () => (localStorage.getItem('ai_tone') as 'friendly' | 'professional' | 'story') || 'friendly'
  )
  const [refining, setRefining] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')

  const labelCls = 'block text-xs font-medium text-zinc-500 mb-1.5'

  async function handleGenerate() {
    if (!rawInput.trim()) return
    setGenerating(true)
    setStreamedContent('')

    try {
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

      const userContent = existingContent?.trim()
        ? `현재 작성된 글이 있어. 아래 재료를 참고해서 기존 글을 자연스럽게 확장하거나 보완해줘. 기존 글의 톤과 흐름을 유지하면서 내용을 더 풍부하게 만들어줘.\n\n## 기존 글\n${existingContent}\n\n## 추가 재료\n${rawInput}\n\n${toneMap[tone] || toneMap.friendly} 최종 완성 글을 출력해줘.`
        : `다음 재료로 블로그 글을 ${toneMap[tone] || toneMap.friendly} 작성해줘:\n\n${rawInput}`

      const stream = await glmStream({
        model: GLM_MODELS.powerful,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userContent,
        }],
      })

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let result = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result += decoder.decode(value, { stream: true })
        setStreamedContent(result)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('AI generate error:', err)
      alert(`AI 생성 오류:\n${msg}`)
    } finally {
      setGenerating(false)
    }
  }

  async function handleRefine(action: string) {
    const selection = window.getSelection()?.toString()
    if (!selection?.trim()) {
      alert('수정할 텍스트를 드래그해서 선택해주세요.')
      return
    }

    setRefining(true)
    try {
      const actionPrompts: Record<string, string> = {
        rewrite: '같은 내용을 다른 표현으로 다시 써줘. 원문보다 자연스럽게.',
        funnier: '더 재미있고 생동감 있게 써줘. 약간의 유머를 섞어도 좋아.',
        shorter: '핵심만 남기고 절반으로 줄여줘. 중요한 내용은 빠지면 안 돼.',
        professional: '더 전문적이고 신뢰감 있는 톤으로 바꿔줘.',
      }

      const result = await glmText({
        model: GLM_MODELS.default,
        messages: [{
          role: 'user',
          content: `다음 단락을 ${actionPrompts[action]}\n\n---\n${selection}\n---\n\n수정된 단락만 출력해줘.`,
        }],
      })

      if (result) {
        await navigator.clipboard.writeText(result)
        alert('수정된 텍스트가 클립보드에 복사되었습니다.')
      }
    } finally {
      setRefining(false)
    }
  }

  const tones = [
    { value: 'friendly', label: '친근' },
    { value: 'professional', label: '전문적' },
    { value: 'story', label: '스토리' },
  ] as const

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={labelCls}>재료 입력</label>
        <textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          className="w-full h-72 px-3 py-2.5 border border-zinc-700/60 rounded-lg bg-zinc-800/60 text-sm text-zinc-200 placeholder:text-zinc-500 resize-none focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
          placeholder={`주제·경험·생각을 자유롭게 던져주세요. 문장 아니어도 됩니다.\n\n잘 쓰는 법\n· 키워드 나열: supabase storage, presigned url 삽질, public bucket으로 해결\n· 흐름 메모: 문제 → 원인 → 해결 → 느낀 점\n· 독자에게 전하고 싶은 한 줄\n\n많이 줄수록 글이 풍부해집니다.`}
        />
      </div>

      <div>
        <label className={labelCls}>톤</label>
        <div className="flex gap-2">
          {tones.map((t) => (
            <button
              key={t.value}
              onClick={() => { setTone(t.value); localStorage.setItem('ai_tone', t.value) }}
              className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                tone === t.value
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-700/60 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!rawInput.trim() || generating}
        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            생성 중...
          </>
        ) : (
          existingContent?.trim() ? '내용 추가하기' : 'AI로 글 생성하기'
        )}
      </button>

      {streamedContent && (
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-zinc-800/60 rounded-lg border border-zinc-700/60 text-sm text-zinc-400 whitespace-pre-wrap max-h-56 overflow-y-auto">
            {streamedContent}
          </div>

          {!generating && (
            <>
              <button
                onClick={() => onGenerated(streamedContent)}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-sm font-semibold transition-colors"
              >
                에디터에 적용
              </button>

              <div>
                <p className="text-xs text-zinc-600 mb-2">단락 수정 (텍스트 선택 후 클릭)</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { action: 'rewrite', label: '다시 쓰기' },
                    { action: 'funnier', label: '더 재미있게' },
                    { action: 'shorter', label: '짧게' },
                    { action: 'professional', label: '전문적으로' },
                  ].map(({ action, label }) => (
                    <button
                      key={action}
                      onClick={() => handleRefine(action)}
                      disabled={refining}
                      className="py-1.5 text-xs border border-zinc-700/60 rounded-lg text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300 disabled:opacity-50 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AIWritingAssistant
