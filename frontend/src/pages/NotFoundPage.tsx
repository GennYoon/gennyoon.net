import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[100dvh] bg-zinc-950 flex flex-col items-center justify-center text-center px-6">
      <div className="text-8xl mb-8 opacity-20">404</div>
      <h1 className="text-2xl font-bold text-zinc-100 mb-4">페이지를 찾을 수 없습니다</h1>
      <p className="text-zinc-500 mb-8">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link
        to="/"
        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full font-semibold text-sm transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}

export default NotFoundPage
