# gennyoon.net

노마드 코더 GennYoon의 AI 개발 블로그.

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL, `gennyoon` 스키마)
- **Auth**: Supabase Auth
- **AI**: GLM-4 (via `@ai-sdk/openai`, bigmodel.cn)
- **Editor**: Tiptap
- **Font**: Pretendard

## 주요 기능

- 블로그 홈, 카테고리, 포스트 상세
- 어드민 — 글 작성/수정, AI 글쓰기 어시스턴트, 크로스포스팅
- AI 시스템 프롬프트 관리
- OG 이미지 동적 생성
- 조회수 (24시간 중복 차단)

## 로컬 개발

```bash
# 패키지 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local 편집

# 개발 서버
npm run dev
```

### Supabase 로컬

```bash
# 마이그레이션 적용
/supabase migrate
```

## 환경변수

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `SUPABASE_SCHEMA` | DB 스키마 (`gennyoon`) |
| `GLM_API_KEY` | GLM AI API 키 |

## 브랜치 전략

- `main` — 프로덕션
- `develop` — 개발 통합
- `feature/이슈번호-설명` — 기능 개발
