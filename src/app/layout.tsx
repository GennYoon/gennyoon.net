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
  description: '노마드 코더 GennYoon의 AI 개발 블로그. AI로 만들고, 배우고, 기록합니다.',
  metadataBase: new URL('https://gennyoon.net'),
  keywords: ['AI 개발', '노마드 코더', 'Claude Code', '1인 개발', 'Next.js', 'GennYoon'],
  authors: [{ name: 'GennYoon', url: 'https://gennyoon.net' }],
  creator: 'GennYoon',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://gennyoon.net',
    siteName: 'gennyoon.net',
    title: 'gennyoon.net',
    description: '노마드 코더 GennYoon의 AI 개발 블로그. AI로 만들고, 배우고, 기록합니다.',
    images: [{ url: '/og?title=gennyoon.net&category=&emoji=✍️', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'gennyoon.net',
    description: '노마드 코더 GennYoon의 AI 개발 블로그. AI로 만들고, 배우고, 기록합니다.',
    images: ['/og?title=gennyoon.net&category=&emoji=✍️'],
  },
  robots: {
    index: true,
    follow: true,
  },
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
