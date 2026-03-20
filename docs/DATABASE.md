# Database Schema

Supabase PostgreSQL 기반 스키마.

## 테이블 목록

| 테이블 | 설명 |
|--------|------|
| `categories` | 블로그 카테고리 |
| `tags` | 태그 |
| `posts` | 블로그 포스트 |
| `post_tags` | 포스트-태그 연결 |
| `cross_posts` | 크로스포스팅 기록 |
| `ai_prompts` | AI 프롬프트 (카테고리별) |
| `drafts` | AI 글쓰기 임시저장 |

## 초기 SQL 위치

`docs/supabase-schema.sql` 참조.

## RLS 정책

- 퍼블릭 읽기: `published` 상태 posts, 모든 categories/tags
- 인증된 사용자: 전체 CRUD 권한

## 유용한 함수

- `increment_view_count(post_slug text)` — 조회수 증가 (security definer)
- `handle_updated_at()` — updated_at 자동 갱신 트리거
