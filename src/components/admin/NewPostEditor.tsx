'use client'

import { useState, useCallback } from 'react'
import { marked } from 'marked'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugifyKo } from '@/lib/utils'
import AIWritingAssistant from './AIWritingAssistant'
import CrossPostPanel from './CrossPostPanel'
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Loader2
} from 'lucide-react'

interface Category {
  id: string
  slug: string
  name: string
  emoji: string
}

interface Props {
  categories: Category[]
  post?: {
    id: string
    title: string
    slug: string
    content: string
    content_markdown: string
    cover_image: string
    category_id: string
    status: string
    seo_title: string
    seo_description: string
    published_at: string | null
  }
}

export default function NewPostEditor({ categories, post }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [categoryId, setCategoryId] = useState(post?.category_id || '')
  const [status, setStatus] = useState(post?.status || 'draft')
  const [seoTitle, setSeoTitle] = useState(post?.seo_title || '')
  const [seoDescription, setSeoDescription] = useState(post?.seo_description || '')
  const [coverImage, setCoverImage] = useState(post?.cover_image || '')
  const [saving, setSaving] = useState(false)
  const [savedPostId, setSavedPostId] = useState(post?.id || '')
  const [publishedAt, setPublishedAt] = useState(post?.published_at || null)
  const [titleCandidates, setTitleCandidates] = useState<string[]>([])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: 'AI가 생성한 글이 여기에 들어옵니다...',
      }),
    ],
    content: post?.content || '',
    editorProps: {
      attributes: {
        class: 'prose-gennyoon max-w-none focus:outline-none min-h-[400px] px-6 py-4',
      },
    },
  })

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!post) {
      setSlug(slugifyKo(value))
    }
  }

  const parseGeneratedContent = useCallback(
    (content: string) => {
      const titleSection = content.match(/## 제목 후보\n([\s\S]*?)(?=\n## |$)/)
      if (titleSection) {
        const candidates = titleSection[1]
          .split('\n')
          .filter((line) => /^\d+\./.test(line.trim()))
          .map((line) => line.replace(/^\d+\.\s*/, '').trim())
          .filter(Boolean)
        setTitleCandidates(candidates)
      }

      const bodySection = content.match(/## 본문\n([\s\S]*?)(?=\n## |$)/)
      if (bodySection && editor) {
        const html = marked.parse(bodySection[1].trim()) as string
        editor.commands.setContent(html)
      }

      const seoSection = content.match(/## SEO\n([\s\S]*?)$/)
      if (seoSection) {
        const descMatch = seoSection[1].match(/- description:\s*(.+)/)
        if (descMatch) setSeoDescription(descMatch[1].trim())
      }
    },
    [editor]
  )

  async function handleSave(publishStatus?: string) {
    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    setSaving(true)
    const supabase = createClient()
    const finalStatus = publishStatus || status

    const targetId = post?.id || savedPostId
    const newPublishedAt = finalStatus === 'published'
      ? (publishedAt || new Date().toISOString())
      : null

    const payload = {
      title: title.trim(),
      slug: slug.trim() || slugifyKo(title),
      content: editor?.getHTML() || '',
      content_markdown: editor?.getText() || '',
      category_id: categoryId || null,
      status: finalStatus,
      seo_title: seoTitle,
      seo_description: seoDescription,
      cover_image: coverImage,
      published_at: newPublishedAt,
    }

    try {
      if (targetId) {
        const { error } = await supabase.from('posts').update(payload).eq('id', targetId)
        if (error) throw error
        setSavedPostId(targetId)
      } else {
        const { data, error } = await supabase.from('posts').insert(payload).select('id').single()
        if (error) throw error
        setSavedPostId(data.id)
      }

      setStatus(finalStatus)
      setPublishedAt(newPublishedAt)
      if (finalStatus === 'published') {
        alert('발행되었습니다!')
      } else {
        alert('저장되었습니다.')
      }
    } catch (err) {
      console.error(err)
      alert('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-zinc-700/60 rounded-lg bg-zinc-800/60 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-500 mb-1'

  const ToolbarButton = ({
    onClick,
    active,
    children,
  }: {
    onClick: () => void
    active?: boolean
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-zinc-700 text-emerald-400'
          : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* 제목 후보 모달 */}
      {titleCandidates.length > 0 && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700/60 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-semibold text-zinc-100 mb-4">
              제목을 선택해주세요
            </h3>
            <div className="space-y-2">
              {titleCandidates.map((candidate, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTitle(candidate)
                    setSlug(slugifyKo(candidate))
                    setTitleCandidates([])
                  }}
                  className="w-full text-left px-4 py-3 border border-zinc-700/60 rounded-xl hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors text-sm text-zinc-200"
                >
                  {candidate}
                </button>
              ))}
            </div>
            <button
              onClick={() => setTitleCandidates([])}
              className="mt-4 w-full py-2 text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              직접 입력할게요
            </button>
          </div>
        </div>
      )}

      {/* 왼쪽: AI 어시스턴트 */}
      <div className="w-[40%] border-r border-zinc-800/60 overflow-y-auto p-4 bg-zinc-900/30">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">✨ AI 글쓰기 어시스턴트</h2>
        <AIWritingAssistant
          categories={categories}
          onGenerated={parseGeneratedContent}
        />
      </div>

      {/* 오른쪽: 에디터 */}
      <div className="w-[60%] flex flex-col overflow-hidden">
        {/* 툴바 */}
        {editor && (
          <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-800/60 bg-zinc-900/40 flex-wrap">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-4 bg-zinc-700 mx-1" />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
            >
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
            >
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
            >
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-4 bg-zinc-700 mx-1" />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
            >
              <Code className="w-4 h-4" />
            </ToolbarButton>
          </div>
        )}

        {/* 에디터 콘텐츠 */}
        <div className="flex-1 overflow-y-auto bg-zinc-950">
          <EditorContent editor={editor} />
        </div>

        {/* 메타 정보 */}
        <div className="border-t border-zinc-800/60 p-4 space-y-3 overflow-y-auto max-h-72 bg-zinc-900/40">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>제목 *</label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={inputCls}
                placeholder="글 제목"
              />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={inputCls}
                placeholder="url-slug"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>SEO 제목</label>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className={inputCls}
                placeholder="60자 이내"
                maxLength={60}
              />
            </div>
            <div>
              <label className={labelCls}>카테고리</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputCls}
              >
                <option value="">카테고리 선택</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>SEO 설명</label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="160자 이내"
              maxLength={160}
            />
          </div>

          <div>
            <label className={labelCls}>커버 이미지 URL</label>
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className={inputCls}
              placeholder="https://..."
            />
          </div>

          {savedPostId && (
            <CrossPostPanel postId={savedPostId} postStatus={status} />
          )}

          {/* 저장 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex-1 py-2.5 border border-zinc-700/60 text-zinc-400 rounded-xl text-sm font-medium hover:bg-zinc-800/60 hover:text-zinc-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              임시저장
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              발행하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
