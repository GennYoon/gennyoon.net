# Architecture — gennyoon.net

## 디렉토리 구조

```
src/
├── app/
│   ├── (public)/           # 퍼블릭 라우트 그룹
│   │   ├── layout.tsx      # 헤더/푸터
│   │   ├── page.tsx        # 홈
│   │   ├── blog/[slug]/    # 글 상세
│   │   └── category/[slug]/
│   ├── (admin)/            # 어드민 라우트 그룹 (인증 필요)
│   │   ├── layout.tsx      # 사이드바
│   │   └── admin/
│   │       ├── page.tsx    # 대시보드
│   │       ├── posts/
│   │       ├── prompts/
│   │       └── login/
│   ├── api/
│   │   ├── ai/             # AI API Routes
│   │   └── crosspost/      # 크로스포스팅 Routes
│   └── og/                 # OG 이미지 (Edge)
├── components/
│   ├── admin/
│   │   ├── AIWritingAssistant.tsx
│   │   ├── NewPostEditor.tsx
│   │   └── CrossPostPanel.tsx
│   ├── blog/
│   └── ui/
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # 브라우저 클라이언트
│   │   └── server.ts       # 서버 클라이언트
│   ├── glm.ts              # GLM AI 클라이언트
│   └── utils.ts
└── middleware.ts            # /admin/* 인증 체크
```

## 데이터 흐름

### AI 글쓰기 플로우
```
재료 입력 → AIWritingAssistant → POST /api/ai/generate
→ Supabase (ai_prompts 조회) → GLM streamText
→ 스트리밍 응답 → 에디터 적용
```

### 크로스포스팅 플로우
```
CrossPostPanel → POST /api/crosspost/{platform}
→ Supabase (post 조회)
→ (Medium만) /api/ai/translate 호출
→ 외부 API 포스팅
→ cross_posts 테이블 기록
```

## 인증 흐름

- Supabase Auth (이메일/패스워드)
- `middleware.ts`에서 `/admin/*` 보호
- `(admin)/layout.tsx`에서 이중 체크
