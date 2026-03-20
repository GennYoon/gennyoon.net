import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'gennyoon.net',
    template: '%s | gennyoon.net',
  },
  description: '전직 CTO의 AI 노마드 블로그. 세계 각지에서 AI와 함께 개발하고 기록합니다.',
  metadataBase: new URL('https://gennyoon.net'),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${geistMono.variable} noise`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.min.css"
        />
        <script
          src="https://code.iconify.design/iconify-icon/2.3.0/iconify-icon.min.js"
          async
        />
      </head>
      <body className="min-h-[100dvh] bg-zinc-950 text-zinc-50 antialiased">
        {children}
      </body>
    </html>
  )
}
