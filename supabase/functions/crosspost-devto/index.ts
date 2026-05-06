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
      { db: { schema: 'gennyoon' } }
    )

    const { data: post, error } = await supabase.from('posts').select('*, categories(name, slug)').eq('id', postId).single()
    if (error || !post) return new Response('Post not found', { status: 404, headers: corsHeaders })

    const devtoRes = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: {
        'api-key': Deno.env.get('DEVTO_API_KEY')!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        article: {
          title: post.title,
          body_markdown: post.content_markdown || post.content || '',
          published: false,
          canonical_url: `https://gennyoon.net/blog/${post.slug}`,
          tags: [],
        },
      }),
    })

    if (!devtoRes.ok) return new Response('Dev.to posting failed', { status: 502, headers: corsHeaders })

    const data = await devtoRes.json()

    await supabase.from('cross_posts').insert({
      post_id: postId, platform: 'devto',
      external_id: String(data.id), external_url: data.url,
    })

    return new Response(JSON.stringify({ url: data.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})
