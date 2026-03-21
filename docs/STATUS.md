# STATUS — 현재 진행상황

## 현재 단계: 로컬 개발 환경 완료, 기능 검증 단계

**날짜**: 2026-03-21

---

## 완료된 작업

### 인프라 / 환경
- [x] Next.js 15 (App Router) + TypeScript 프로젝트 세팅
- [x] Tailwind CSS v4 설정
- [x] Supabase 로컬 인스턴스 연동 (gennyoon 스키마)
- [x] Supabase 마이그레이션 (`supabase/migrations/20260321000000_init.sql`)
- [x] GLM AI 클라이언트 (`src/lib/glm.ts`)
- [x] 어드민 인증 미들웨어
- [x] devist 프로젝트 등록 완료 (slug: gennyoon-net)

### 퍼블릭 페이지
- [x] 홈페이지 — 히어로(그라디언트 메시), 카테고리 스트립, 피처드 포스트, 벤토 그리드
- [x] 블로그 상세 (`/blog/[slug]`) — 본문, 조회수, OG 메타
- [x] 카테고리 페이지 (`/category/[slug]`) — 탭 필터, 포스트 그리드
- [x] NavClient — 스크롤 감지 플로팅 네비게이션
- [x] ScrollReveal — IntersectionObserver 스크롤 애니메이션
- [x] PostCard 컴포넌트 — large/normal 모드

### 어드민 페이지
- [x] 로그인 (`/admin/login`) — 무한루프 수정 완료 ((auth) 라우트 그룹 분리)
- [x] 대시보드 (`/admin`) — 통계 카드, 최근 글 목록
- [x] 글 목록 (`/admin/posts`) — 상태/크로스포스팅 현황
- [x] 새 글 작성 / 수정 (`/admin/posts/new`, `/admin/posts/[id]`)
- [x] AI 프롬프트 관리 (`/admin/prompts`) — 카테고리별 시스템 프롬프트 편집
- [x] 전체 다크 테마 통일 (zinc-950 + emerald)

### 컴포넌트
- [x] NewPostEditor — Tiptap 에디터 + 메타 필드 (immediatelyRender: false SSR 수정)
- [x] AIWritingAssistant — GLM 스트리밍, 이미지 업로드, 카테고리/톤 선택
- [x] CrossPostPanel — LinkedIn / Medium / Dev.to 크로스포스팅

### API Routes
- [x] `/api/ai/generate` — GLM 스트리밍 글 생성
- [x] `/api/ai/refine` — 단락 수정
- [x] `/api/ai/translate` — 번역
- [x] `/api/ai/seo` — SEO 자동 생성
- [x] `/api/crosspost/devto`, `medium`, `linkedin`
- [x] `/api/posts/[slug]/view` — 조회수 증가 (24시간 중복 차단)
- [x] `/og` — OG 이미지 동적 생성

---

## 미완료 / 검증 필요

- [ ] Supabase Storage 버킷 `blog-images` 생성 (이미지 업로드 기능)
- [ ] Supabase Auth 어드민 계정 생성
- [ ] GLM API 키 설정 (`GLM_API_KEY` in `.env.local`)
- [ ] 크로스포스팅 API 키 설정 (LinkedIn, Medium, Dev.to)
- [ ] 프로덕션 배포 (Vercel + Supabase Cloud)
- [ ] develop 브랜치 생성 및 Git 워크플로우 정착

---

## 알려진 이슈

없음

---

## 브랜치 현황

- `main` — 현재 유일한 브랜치 (초기 구현 커밋 완료)
- `develop` 브랜치 미생성 — dev 스킬 사용 전 생성 필요
