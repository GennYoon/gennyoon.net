import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Zhipu AI: {id}.{secret} → JWT (HS256)
async function generateGlmToken(apiKey: string): Promise<string> {
  const [id, secret] = apiKey.split('.')
  const now = Date.now()

  const header = btoa(JSON.stringify({ alg: 'HS256', sign_type: 'SIGN' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payload = btoa(JSON.stringify({ api_key: id, exp: now + 3600 * 1000, timestamp: now })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const unsigned = `${header}.${payload}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(unsigned))
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  return `${unsigned}.${signature}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const apiKey = Deno.env.get('GLM_API_KEY')!
    const token = await generateGlmToken(apiKey)

    const res = await fetch('https://api.z.ai/api/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      return new Response(text, { status: res.status, headers: corsHeaders })
    }

    return new Response(res.body, {
      status: res.status,
      headers: {
        ...corsHeaders,
        'Content-Type': res.headers.get('Content-Type') ?? 'application/json',
      },
    })
  } catch (err) {
    console.error(err)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})
