import React, { useState, useCallback, useImperativeHandle, forwardRef, useRef, useEffect } from 'react'
import { marked } from 'marked'
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { supabase } from '@/lib/supabase/client'
import { slugifyKo } from '@/lib/utils'
import AIWritingAssistant from './AIWritingAssistant'
import CrossPostPanel from './CrossPostPanel'
import CodeBlockView from './CodeBlockView'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Code2, ImagePlus, Upload, X, Loader2
} from 'lucide-react'

const lowlight = createLowlight(common)

export interface NewPostEditorHandle {
  save: (status: string) => Promise<void>
}

interface Category {
  id: string
  slug: string
  name: string
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

const inputCls = 'w-full px-3 py-2 text-sm border border-zinc-700/60 rounded-lg bg-zinc-800/60 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-500 mb-1'

const NewPostEditor = forwardRef<NewPostEditorHandle, Props>(({ categories, post }, ref) => {
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [categoryId, setCategoryId] = useState(post?.category_id || '')
  const [status, setStatus] = useState(post?.status || 'draft')
  const [seoDescription, setSeoDescription] = useState(post?.seo_description || '')
  const [coverImage, setCoverImage] = useState(post?.cover_image || '')
  const [coverUploading, setCoverUploading] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [savedPostId, setSavedPostId] = useState(post?.id || '')
  const [publishedAt, setPublishedAt] = useState(post?.published_at || null)
  const [titleCandidates, setTitleCandidates] = useState<string[]>([])
  const [aiApplied, setAiApplied] = useState(!!post)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      ImageExtension.configure({ inline: false }),
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'AI가 생성한 글이 여기에 들어옵니다...' }),
      CodeBlockLowlight.configure({ lowlight }).extend({
        addNodeView() { return ReactNodeViewRenderer(CodeBlockView) },
      }),
    ],
    content: '',
    onCreate: ({ editor: e }) => {
      if (post?.content) e.commands.setContent(post.content)
    },
    editorProps: {
      attributes: {
        class: 'prose-gennyoon max-w-none focus:outline-none min-h-full px-6 py-5',
      },
    },
  })

  const handleEditorImageUpload = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file || !editor) return
    const ext = file.name.split('.').pop()
    const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('blog-images').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('blog-images').getPublicUrl(path)
      editor.chain().focus().setImage({ src: data.publicUrl }).run()
    }
  }

  const handleCoverUpload = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setCoverUploading(true)
    const ext = file.name.split('.').pop()
    const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('blog-images').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('blog-images').getPublicUrl(path)
      setCoverImage(data.publicUrl)
    }
    setCoverUploading(false)
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!post) setSlug(slugifyKo(value))
  }

  const parseGeneratedContent = useCallback(
    (content: string) => {
      setAiApplied(true)
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

  const handleSave = useCallback(async (publishStatus?: string) => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    setSaving(true)
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
      seo_title: title.trim(),
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
      if (newPublishedAt !== undefined) setPublishedAt(newPublishedAt)
      alert(finalStatus === 'published' ? '발행되었습니다!' : '저장되었습니다.')
    } catch (err) {
      console.error(err)
      alert('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, title, slug, categoryId, status, seoDescription, coverImage, savedPostId, publishedAt, post?.id])

  useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave])


  const ToolbarButton = ({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-zinc-700 text-emerald-400' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}
    >
      {children}
    </button>
  )

  return (
    <div className="h-full flex">

      {/* 제목 후보 모달 */}
      {titleCandidates.length > 0 && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700/60 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-semibold text-zinc-100 mb-4">제목을 선택해주세요</h3>
            <div className="space-y-2">
              {titleCandidates.map((candidate, i) => (
                <button
                  key={i}
                  onClick={() => { setTitle(candidate); setSlug(slugifyKo(candidate)); setTitleCandidates([]) }}
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

      {/* 왼쪽: 글 정보 + AI 어시스턴트 */}
      <div className="w-[400px] shrink-0 border-r border-zinc-800 overflow-y-auto bg-zinc-900/60">
        <div className="p-5 space-y-5">

          {/* AI 글쓰기 어시스턴트 */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">AI 글쓰기 어시스턴트</p>
            <AIWritingAssistant
              onGenerated={parseGeneratedContent}
              categorySlug={categories.find((c) => c.id === categoryId)?.slug}
              existingContent={editor?.getText().trim() ? editor.getHTML() : undefined}
            />
          </div>

          <div className="border-t border-zinc-800/60" />

          {/* 글 정보 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">글 정보</p>
              {!aiApplied && <span className="text-[10px] text-zinc-600">AI 생성 후 수정 가능</span>}
            </div>

            <div className={`space-y-3 transition-opacity ${!aiApplied ? 'opacity-40 pointer-events-none select-none' : ''}`}>
              <div>
                <label className={labelCls}>제목 *</label>
                <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="글 제목" />
              </div>

              <div>
                <label className={labelCls}>카테고리</label>
                <Select value={categoryId || '__none__'} onValueChange={(v) => setCategoryId(v === '__none__' ? '' : v)}>
                  <SelectTrigger className="border-zinc-700/60 bg-zinc-800/60 text-zinc-100 focus:ring-emerald-500/50">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700/60 text-zinc-100">
                    <SelectItem value="__none__" className="focus:bg-zinc-800 focus:text-zinc-100">카테고리 없음</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="focus:bg-zinc-800 focus:text-zinc-100">{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={labelCls}>SEO 설명</label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={4}
                  className={`${inputCls} resize-none`}
                  placeholder="160자 이내"
                  maxLength={160}
                />
              </div>

              <div>
                <label className={labelCls}>커버 이미지</label>
                {coverImage ? (
                  <div className="relative group">
                    <img src={coverImage} alt="cover" className="w-full h-28 object-cover rounded-lg border border-zinc-700/60" />
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="border border-dashed border-zinc-700/60 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors"
                    onClick={() => coverInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleCoverUpload(e.dataTransfer.files) }}
                  >
                    {coverUploading ? (
                      <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        업로드 중...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-xs text-zinc-600">
                        <Upload className="w-3.5 h-3.5" />
                        클릭하거나 드래그해서 업로드
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleCoverUpload(e.target.files)}
                />
              </div>
            </div>
          </div>

          {savedPostId && <CrossPostPanel postId={savedPostId} postStatus={status} />}

        </div>
      </div>

      {/* 오른쪽: 마크다운 에디터 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {editor && (
          <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-800/60 bg-zinc-900/40 flex-wrap shrink-0">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-4 bg-zinc-700 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-4 bg-zinc-700 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}>
              <Code className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}>
              <Code2 className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-4 bg-zinc-700 mx-1" />
            <ToolbarButton onClick={() => imageInputRef.current?.click()}>
              <ImagePlus className="w-4 h-4" />
            </ToolbarButton>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { handleEditorImageUpload(e.target.files); e.target.value = '' }}
            />
          </div>
        )}
        <div className="flex-1 overflow-y-auto bg-zinc-950">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>

    </div>
  )
})

export default NewPostEditor
