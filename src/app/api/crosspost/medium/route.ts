import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { postId } = await request.json()

    if (!postId) {
      return new Response('postId is required', { status: 400 })
    }

    const supabase = await createClient()

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (error || !post) {
      return new Response('Post not found', { status: 404 })
    }

    // 영어 번역
    const translateRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/ai/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: post.title,
        content: post.content_markdown || post.content || '',
      }),
    })

    const translated = await translateRes.json()

    // Medium 사용자 ID 조회
    const meRes = await fetch('https://api.medium.com/v1/me', {
      headers: {
        Authorization: `Bearer ${process.env.MEDIUM_TOKEN}`,
      },
    })
    const meData = await meRes.json()
    const userId = meData.data?.id

    if (!userId) {
      return new Response('Failed to get Medium user ID', { status: 502 })
    }

    const mediumPayload = {
      title: translated.title || post.title,
      contentFormat: 'markdown',
      content: translated.content || post.content_markdown || '',
      canonicalUrl: `https://gennyoon.net/blog/${post.slug}`,
      publishStatus: 'draft',
    }

    const mediumRes = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MEDIUM_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mediumPayload),
    })

    if (!mediumRes.ok) {
      const errText = await mediumRes.text()
      console.error('Medium error:', errText)
      return new Response('Medium posting failed', { status: 502 })
    }

    const mediumData = await mediumRes.json()

    await supabase.from('cross_posts').insert({
      post_id: postId,
      platform: 'medium',
      external_id: mediumData.data?.id,
      external_url: mediumData.data?.url,
    })

    return Response.json({ url: mediumData.data?.url })
  } catch (error) {
    console.error('Crosspost medium error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
