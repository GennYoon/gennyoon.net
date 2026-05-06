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

    const { data: post, error } = await supabase.from('posts').select('*').eq('id', postId).single()
    if (error || !post) return new Response('Post not found', { status: 404, headers: corsHeaders })

    const description = post.seo_description || post.title
    const commentary = `${description}\n\n👉 https://gennyoon.net/blog/${post.slug}`

    const linkedinRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('LINKEDIN_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: Deno.env.get('LINKEDIN_PERSON_URN'),
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: commentary },
            shareMediaCategory: 'ARTICLE',
            media: [{
              status: 'READY',
              description: { text: description },
              originalUrl: `https://gennyoon.net/blog/${post.slug}`,
              title: { text: post.title },
            }],
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    })

    if (!linkedinRes.ok) {
      return new Response('LinkedIn posting failed', { status: 502, headers: corsHeaders })
    }

    const data = await linkedinRes.json()
    const postUrl = `https://www.linkedin.com/feed/update/${data.id}`

    await supabase.from('cross_posts').insert({
      post_id: postId, platform: 'linkedin',
      external_id: data.id, external_url: postUrl,
    })

    return new Response(JSON.stringify({ url: postUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})
