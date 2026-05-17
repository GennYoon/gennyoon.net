import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { postId } = await req.json()
    if (!postId) return new Response('postId required', { status: 400, headers: corsHeaders })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { db: { schema: 'public' } }
    )

    const { data: post, error } = await supabase.from('posts').select('*').eq('id', postId).single()
    if (error || !post) return new Response('Post not found', { status: 404, headers: corsHeaders })

    const meRes = await fetch('https://api.medium.com/v1/me', {
      headers: { Authorization: `Bearer ${Deno.env.get('MEDIUM_TOKEN')}` },
    })
    const meData = await meRes.json()
    const userId = meData.data?.id
    if (!userId) return new Response('Failed to get Medium user ID', { status: 502, headers: corsHeaders })

    const mediumRes = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('MEDIUM_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: post.title,
        contentFormat: 'markdown',
        content: post.content_markdown || post.content || '',
        canonicalUrl: `https://gennyoon.net/blog/${post.slug}`,
        publishStatus: 'draft',
      }),
    })

    if (!mediumRes.ok) return new Response('Medium posting failed', { status: 502, headers: corsHeaders })

    const data = await mediumRes.json()

    await supabase.from('cross_posts').insert({
      post_id: postId, platform: 'medium',
      external_id: data.data?.id, external_url: data.data?.url,
    })

    return new Response(JSON.stringify({ url: data.data?.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})
