import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

const CATEGORY_COLORS: Record<string, string> = {
  'ai-tools': '#6366f1',
  'dev-log': '#0ea5e9',
  'ai-dev-team': '#8b5cf6',
  'ai-marketing': '#f59e0b',
  'ai-video': '#ec4899',
  'nomad-life': '#10b981',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'gennyoon.net'
  const category = searchParams.get('category') || ''
  const emoji = searchParams.get('emoji') || '✍️'

  const color = CATEGORY_COLORS[category] || '#6366f1'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          background: `linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, ${color}22 100%)`,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: color,
            }}
          />
          <span style={{ color: '#888', fontSize: '18px' }}>gennyoon.net</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <span style={{ fontSize: '72px' }}>{emoji}</span>
          <h1
            style={{
              fontSize: title.length > 30 ? '42px' : '56px',
              color: '#ffffff',
              margin: 0,
              lineHeight: 1.3,
              fontWeight: 700,
            }}
          >
            {title}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              padding: '8px 20px',
              borderRadius: '100px',
              background: color,
              color: '#fff',
              fontSize: '16px',
            }}
          >
            전직 CTO의 AI 노마드 블로그
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
