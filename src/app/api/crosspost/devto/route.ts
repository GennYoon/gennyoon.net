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
      .select('*, categories(name, slug)')
      .eq('id', postId)
      .single()

    if (error || !post) {
      return new Response('Post not found', { status: 404 })
    }

    const devtoPayload = {
      article: {
        title: post.title,
        body_markdown: post.content_markdown || post.content || '',
        published: false,
        canonical_url: `https://gennyoon.net/blog/${post.slug}`,
        tags: [],
      },
    }

    const devtoRes = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: {
        'api-key': process.env.DEVTO_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(devtoPayload),
    })

    if (!devtoRes.ok) {
      const errText = await devtoRes.text()
      console.error('Dev.to error:', errText)
      return new Response('Dev.to posting failed', { status: 502 })
    }

    const devtoData = await devtoRes.json()

    await supabase.from('cross_posts').insert({
      post_id: postId,
      platform: 'devto',
      external_id: String(devtoData.id),
      external_url: devtoData.url,
    })

    return Response.json({ url: devtoData.url })
  } catch (error) {
    console.error('Crosspost devto error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
