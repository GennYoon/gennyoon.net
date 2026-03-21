import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { postId } = await request.json()

    if (!postId) {
      return new Response('postId is required', { status: 400 })
    }

    const supabase = supabaseAdmin

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (error || !post) {
      return new Response('Post not found', { status: 404 })
    }

    // SEO 설명 가져오기
    const seoRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/ai/seo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: post.title,
        content: post.content_markdown || post.content || '',
      }),
    })

    const seoData = await seoRes.json()
    const description = seoData.seoDescription || post.seo_description || post.title

    const commentary = `${description}\n\n👉 https://gennyoon.net/blog/${post.slug}`

    const linkedinPayload = {
      author: process.env.LINKEDIN_PERSON_URN,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: commentary,
          },
          shareMediaCategory: 'ARTICLE',
          media: [
            {
              status: 'READY',
              description: { text: description },
              originalUrl: `https://gennyoon.net/blog/${post.slug}`,
              title: { text: post.title },
            },
          ],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }

    const linkedinRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(linkedinPayload),
    })

    if (!linkedinRes.ok) {
      const errText = await linkedinRes.text()
      console.error('LinkedIn error:', errText)
      return new Response('LinkedIn posting failed', { status: 502 })
    }

    const linkedinData = await linkedinRes.json()
    const postUrl = `https://www.linkedin.com/feed/update/${linkedinData.id}`

    await supabase.from('cross_posts').insert({
      post_id: postId,
      platform: 'linkedin',
      external_id: linkedinData.id,
      external_url: postUrl,
    })

    return Response.json({ url: postUrl })
  } catch (error) {
    console.error('Crosspost linkedin error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
