# AGENT.md — Blog 

> Sub-agent / multi-agent guidance for AI coding tools.

## Mode: devist (structured)

This project uses the **devist 4-role pipeline** when work is non-trivial.

### Roles

| Role | Owns | Output |
|---|---|---|
| **designer** | Wireframes, IA, component spec, design tokens | `_workspace/design/*.md`, Figma refs |
| **frontend-builder** | React components, routing, pages, hooks, a11y | `src/**/*.tsx` |
| **backend-builder** | Schema, migrations, RLS, Edge Functions, contract.json | `supabase/`, `contract.json` |
| **qa-validator** | Vitest unit tests, RLS verification, shape checks | `*.test.ts`, `*.spec.ts` |

### When to spawn each

- **New blog feature** (에디터, 크로스포스팅 등) → designer → frontend + backend 병렬 → qa.
- **Backend-only change** (새 테이블/정책/함수) → backend-builder → qa-validator (RLS 검증).
- **UI 수정 / 버그 픽스** → frontend-builder 단독; 회귀 가능성 높으면 qa 추가.
- **AI/크로스포스팅 통합** (GLM, Dev.to, Medium, LinkedIn) → backend-builder 주도, frontend-builder가 UI 붙임.

### Coordination

1. designer가 `design/<feature>.md` + 토큰 핸드오프.
2. backend-builder가 `contract.json` (테이블 shape, RPC 시그니처, RLS 규칙) 발행.
3. frontend-builder가 `contract.json` 소비; 미완성 부분은 목 처리.
4. qa-validator는 각 모듈 완성 직후 실행 — 전체 완성 후 1회 아님.

### Communication

- 각 에이전트는 작업 시작/완료 시 `_workspace/sprint.md` 업데이트.
- 핸드오프는 파일(contract.json, design spec) 경유 — 채팅 히스토리 아님.
- shape 변경 협의 → contract.json 수정 + `_workspace/ledger.md`에 기록.

### Persistence

- **Plans**: `_workspace/{project,roadmap,sprint}.md` (4-tier: Project / Roadmap / Sprint / Ledger).
- **Decisions**: 커밋 메시지 (이유 포함).
- **Future context**: 이 파일과 `CLAUDE.md`.

### What sub-agents should NOT do

- ❌ UI 표면이 있는 기능에서 designer 건너뜀.
- ❌ 핸드오프 노트 없이 자신의 역할 범위 밖 파일 수정.
- ❌ qa-validator 통과 없이 완료 표시.

## Project-specific notes

- **스키마**: Supabase `public` 스키마. 멀티 스키마 없음.
- **인증**: Supabase Auth. 어드민 페이지는 `/admin/*` — 세션 확인 필수.
- **GLM 연동**: `@/lib/glm`의 `GLM_MODELS` 상수 참조. API 키는 `.env.local`의 `VITE_GLM_API_KEY`.
- **크로스포스팅**: Dev.to / Medium / LinkedIn API. 토큰은 `.env.local`. 실제 발행 전 반드시 확인.
- **Tiptap 에디터**: `src/components/editor/` 하위. 에디터 관련 확장은 이 디렉토리 내에서 관리.
