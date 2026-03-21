import { ImageResponse } from 'next/og'

export const size = { width: 128, height: 128 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 128,
          height: 128,
          borderRadius: '50%',
          background: '#0d1f16',
          border: '4px solid rgba(16, 185, 129, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#34d399',
            fontSize: 58,
            fontWeight: 900,
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
