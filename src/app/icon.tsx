import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#0d1f16',
          border: '1.5px solid rgba(16, 185, 129, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#34d399',
            fontSize: 23,
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
