import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  await supabaseAdmin.rpc('increment_view_count', { post_slug: slug })
  return NextResponse.json({ ok: true })
}
