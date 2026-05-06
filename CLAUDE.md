@AGENTS.md

# CLAUDE.md - Blog

## 세션 시작 시

반드시 아래 순서로 읽는다:
1. `docs/STATUS.md` — 현재 진행상황
2. `docs/PRD.md` — 제품 요구사항
3. `docs/TRD.md` — 기술 요구사항
4. `docs/ARCHITECTURE.md` — 아키텍처
5. `docs/DATABASE.md` — 데이터베이스 스키마

## 프로젝트 개요

전직 CTO GennYoon의 AI 노마드 블로그.
- React 19 + Vite 6 + TypeScript + Tailwind CSS v4
- Supabase (DB + Auth + Storage)
- GLM AI (`@/lib/glm` — 직접 fetch 구현, `VITE_GLM_API_KEY`)
- 크로스포스팅: LinkedIn, Medium, Dev.to

## 코딩 규칙

- `@/` alias로 `src/` 하위 절대 경로 사용
- Supabase 클라이언트: `@/lib/supabase`
- GLM AI: `@/lib/glm` (glm, GLM_MODELS export)
- 날짜 포맷: `formatDate()` from `@/lib/utils`
- 라우팅: `react-router-dom` (BrowserRouter 기반)

## 환경변수

`.env.local.example` 참조. 반드시 `.env.local`이 있어야 동작.

## 주요 경로

- 어드민: `/admin/*` (Supabase Auth 필요)
- 로그인: `/admin/login`
- 블로그: `/blog/:slug`
- OG 이미지: `/og?title=&category=&emoji=`

## 로컬 Supabase

로컬 개발은 **devist의 공유 Supabase Docker** (포트 54321)를 사용한다.  
Blog 전용 supabase 인스턴스를 따로 띄우지 않는다.

```bash
# 공유 인스턴스 시작 (devist repo에서)
cd ~/Workspace/devist/website && supabase start

# Blog 마이그레이션 적용
cd ~/Workspace/devist && ./scripts/local-db-apply.sh blog
```

`.env.local`:
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<로컬 anon key>
VITE_SUPABASE_SCHEMA=gennyoon
```

`gennyoon` 스키마로만 작업한다. `public.*` 테이블 생성 금지.

## devist 워크플로우

| 명령어 | 용도 |
|---|---|
| `devist start Blog --dev` | Supabase 백엔드 + 개발 서버 시작 |
| `devist worker watch` | 파일 이벤트 라이브 확인 |
| `devist worker advice --project Blog` | AI 조언 확인 |

## What Claude should do

1. **Read before writing.** 관련 파일 먼저 읽기. git log로 최근 컨텍스트 확인.
2. **Match the surrounding style.** 기존 컨벤션을 따른다.
3. **Small, reversible changes.** 대규모 리팩터보다 집중적인 수정 선호.
4. **Verify.** 비trivial 변경 후 typecheck/lint 실행.
5. **Don't over-engineer.** 조기 추상화, 투기적 인터페이스 금지.

## What Claude should NOT do

- ❌ 기존 파일 수정으로 충분한데 새 파일 생성.
- ❌ 코드가 하는 일을 설명하는 주석 추가 (좋은 이름이 이미 설명함).
- ❌ `.env*`, 시크릿 파일 커밋.
- ❌ 명시적 요청 없이 README.md나 기획 문서 생성.
