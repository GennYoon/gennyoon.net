import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: '#09090b',
          border: '8px solid rgba(16, 185, 129, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#34d399',
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          G
        </span>
      </div>
    ),
    { ...size }
  )
}
