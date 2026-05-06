import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { glmStream, glmText, GLM_MODELS } from '@/lib/glm'
import { X, Upload, Loader2 } from 'lucide-react'

interface Category {
  id: string
  slug: string
  name: string
  emoji: string
}

interface Props {
  onGenerated: (content: string) => void
  categories: Category[]
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

export default function AIWritingAssistant({ onGenerated, categories }: Props) {
  const [rawInput, setRawInput] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [tone, setTone] = useState<'friendly' | 'professional' | 'story'>('friendly')
  const [uploading, setUploading] = useState(false)
  const [refining, setRefining] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleGenerate() {
    if (!rawInput.trim()) return
    setGenerating(true)
    setStreamedContent('')

    try {
      let systemPrompt = DEFAULT_SYSTEM_PROMPT

      if (selectedCategory) {
        const { data } = await supabase
          .from('ai_prompts')
          .select('system_prompt')
          .eq('category_slug', selectedCategory)
          .single()
        if (data?.system_prompt) systemPrompt = data.system_prompt
      }

      const toneMap: Record<string, string> = {
        friendly: '친근하고 유머러스한 톤으로',
        professional: '전문적이고 신뢰감 있는 톤으로',
        story: '스토리텔링 방식으로',
      }

      const stream = await glmStream({
        model: GLM_MODELS.powerful,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `다음 재료로 블로그 글을 ${toneMap[tone] || toneMap.friendly} 작성해줘:\n\n${rawInput}`,
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
      console.error('AI generate error:', err)
      alert('AI 생성 중 오류가 발생했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    const uploaded: string[] = []

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('blog-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('blog-images').getPublicUrl(path)
        uploaded.push(data.publicUrl)
      }
    }

    setImages((prev) => [...prev, ...uploaded])
    setUploading(false)
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
    { value: 'friendly', label: '😄 친근' },
    { value: 'professional', label: '💼 전문적' },
    { value: 'story', label: '📖 스토리' },
  ] as const

  const labelCls = 'block text-xs font-medium text-zinc-500 mb-1.5'

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 재료 입력 */}
      <div>
        <label className={labelCls}>재료 입력</label>
        <textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          className="w-full h-36 px-4 py-3 border border-zinc-700/60 rounded-xl bg-zinc-800/60 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
          placeholder={`오늘 있었던 일을 편하게 적어주세요.\n문장 아니어도 됩니다. 키워드나 나열도 OK\n\n예: 발리 카페, 인터넷 끊김, Claude Code로 배포 성공`}
        />
      </div>

      {/* 이미지 업로드 */}
      <div>
        <label className={labelCls}>이미지 (선택)</label>
        <div
          className="border-2 border-dashed border-zinc-700/60 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleImageUpload(e.dataTransfer.files) }}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              업로드 중...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-600">
              <Upload className="w-4 h-4" />
              클릭하거나 드래그하여 이미지 추가
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files)}
          />
        </div>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-zinc-700/60" />
                <button
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 카테고리 */}
      <div>
        <label className={labelCls}>카테고리</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug === selectedCategory ? '' : cat.slug)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all duration-200 ${
                selectedCategory === cat.slug
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-700/60 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 톤 */}
      <div>
        <label className={labelCls}>톤</label>
        <div className="flex gap-2">
          {tones.map((t) => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={`flex-1 py-2 text-xs rounded-lg border transition-all duration-200 ${
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

      {/* 생성 버튼 */}
      <button
        onClick={handleGenerate}
        disabled={!rawInput.trim() || generating}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            AI가 글 쓰는 중...
          </>
        ) : (
          '✨ AI로 글 생성하기'
        )}
      </button>

      {/* 스트리밍 결과 */}
      {streamedContent && (
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-1 p-4 bg-zinc-800/60 rounded-xl border border-zinc-700/60 overflow-y-auto text-sm text-zinc-400 whitespace-pre-wrap max-h-64">
            {streamedContent}
          </div>

          {!generating && (
            <>
              <button
                onClick={() => onGenerated(streamedContent)}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-sm font-semibold transition-colors"
              >
                이 내용으로 에디터에 적용
              </button>

              <div>
                <p className="text-xs text-zinc-600 mb-2">단락 수정 (텍스트 선택 후 클릭)</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { action: 'rewrite', label: '🔄 다시 쓰기' },
                    { action: 'funnier', label: '😄 더 재미있게' },
                    { action: 'shorter', label: '✂️ 짧게' },
                    { action: 'professional', label: '💼 전문적으로' },
                  ].map(({ action, label }) => (
                    <button
                      key={action}
                      onClick={() => handleRefine(action)}
                      disabled={refining}
                      className="py-2 text-xs border border-zinc-700/60 rounded-lg text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300 disabled:opacity-50 transition-colors"
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
