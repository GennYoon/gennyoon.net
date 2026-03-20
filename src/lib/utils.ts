import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatDate(date: string | Date) {
  return format(new Date(date), 'yyyy년 M월 d일', { locale: ko })
}

export function slugifyKo(text: string): string {
  return text
    .toLowerCase()
    .replace(/[가-힣]/g, (char) => {
      // 한글은 그대로 유지하고 romanize 라이브러리 없이 간단 처리
      return char
    })
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣ㄱ-ㅎ-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
