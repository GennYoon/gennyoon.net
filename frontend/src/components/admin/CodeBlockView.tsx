import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import type { ReactNodeViewProps } from '@tiptap/react'

const LANGUAGES = [
  'bash', 'shell', 'typescript', 'tsx', 'javascript', 'jsx',
  'python', 'rust', 'go', 'css', 'html', 'json', 'sql', 'yaml', 'docker',
]

const CodeBlockView: React.FC<ReactNodeViewProps> = ({ node, updateAttributes }) => (
  <NodeViewWrapper>
    <div className="my-4 rounded-xl overflow-hidden border border-zinc-700/60" style={{ background: '#0d1117' }}>
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/80 border-b border-zinc-700/40">
        <select
          value={(node.attrs.language as string) || ''}
          onChange={(e) => updateAttributes({ language: e.target.value || null })}
          className="text-xs bg-transparent text-zinc-400 outline-none cursor-pointer hover:text-zinc-200 transition-colors"
        >
          <option value="">언어 선택</option>
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang} style={{ background: '#1c2433' }}>{lang}</option>
          ))}
        </select>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-600/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-600/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-600/50" />
        </div>
      </div>
      <pre className="p-4 overflow-x-auto m-0 bg-transparent">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <NodeViewContent as={"code" as any} className="text-sm font-mono leading-relaxed" />
      </pre>
    </div>
  </NodeViewWrapper>
)

export default CodeBlockView
