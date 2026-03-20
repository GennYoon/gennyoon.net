@AGENTS.md

# gennyoon.net — Claude Code 지시사항

## 세션 시작 시

반드시 아래 순서로 읽는다:
1. `docs/STATUS.md` — 현재 진행상황
2. `docs/PRD.md` — 제품 요구사항
3. `docs/TRD.md` — 기술 요구사항
4. `docs/ARCHITECTURE.md` — 아키텍처
5. `docs/DATABASE.md` — 데이터베이스 스키마

## 프로젝트 개요

전직 CTO GennYoon의 AI 노마드 블로그.
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase (DB + Auth + Storage)
- GLM-5 AI (via @ai-sdk/openai, baseURL: bigmodel.cn)
- 크로스포스팅: LinkedIn, Medium, Dev.to

## 코딩 규칙

- Server Component 우선, 필요한 경우만 'use client'
- Supabase 서버 클라이언트: `@/lib/supabase/server`
- Supabase 클라이언트: `@/lib/supabase/client`
- GLM AI: `@/lib/glm` (glm, GLM_MODELS export)
- 날짜 포맷: `formatDate()` from `@/lib/utils`

## 환경변수

`.env.local.example` 참조. 반드시 `.env.local`이 있어야 동작.

## 주요 경로

- 어드민: `/admin/*` (Supabase Auth 필요)
- 로그인: `/admin/login`
- 블로그: `/blog/[slug]`
- OG 이미지: `/og?title=&category=&emoji=`
