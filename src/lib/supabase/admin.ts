import { createClient } from '@supabase/supabase-js'

// service_role key 사용 — RLS 우회, 절대 클라이언트 노출 금지
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  {
    db: { schema: process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'gennyoon' },
    auth: { autoRefreshToken: false, persistSession: false },
  }
)
