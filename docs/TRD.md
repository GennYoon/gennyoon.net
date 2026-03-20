# TRD — 기술 요구사항

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 백엔드 | Supabase (DB + Auth + Storage) |
| AI | GLM-5 (via @ai-sdk/openai) |
| 에디터 | Tiptap |
| 배포 | Vercel |

## AI 모델

- `glm-4-flash` — 빠른 응답 (단락 수정, SEO, 번역)
- `glm-4-plus` — 긴 글 초안 생성
- Base URL: `https://open.bigmodel.cn/api/paas/v4`

## 외부 API

| 서비스 | 용도 | 환경변수 |
|--------|------|----------|
| Dev.to | 크로스포스팅 | `DEVTO_API_KEY` |
| Medium | 크로스포스팅 (영어 번역) | `MEDIUM_TOKEN` |
| LinkedIn | 크로스포스팅 (한국어) | `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_PERSON_URN` |

## 라우트 구조

```
/ — 홈 (SSG, revalidate: 3600)
/blog/[slug] — 글 상세
/category/[slug] — 카테고리 목록
/og — 동적 OG 이미지 (Edge)

/admin — 대시보드 (인증 필요)
/admin/posts — 글 목록
/admin/posts/new — 새 글 작성
/admin/posts/[id] — 글 수정
/admin/prompts — AI 프롬프트 관리
/admin/login — 로그인

/api/ai/generate — AI 초안 생성 (스트리밍)
/api/ai/refine — 단락 수정
/api/ai/translate — 번역
/api/ai/seo — SEO 메타 생성
/api/crosspost/devto
/api/crosspost/medium
/api/crosspost/linkedin
```

## Supabase Storage

- 버킷: `blog-images` (public)
- 용도: 커버 이미지, 에디터 첨부 이미지
