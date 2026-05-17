import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const url = new URL(req.url)
  const clientId = Deno.env.get('LINKEDIN_CLIENT_ID')!
  const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET')!
  const redirectUri = Deno.env.get('LINKEDIN_REDIRECT_URI')!

  // GET /crosspost-linkedin-auth?action=login → LinkedIn OAuth 시작
  if (url.searchParams.get('action') === 'login') {
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', 'w_member_social openid profile')
    return Response.redirect(authUrl.toString(), 302)
  }

  // GET /crosspost-linkedin-auth?code=... → 콜백 처리
  const code = url.searchParams.get('code')
  if (!code) {
    return new Response('Missing code', { status: 400 })
  }

  // code → access_token 교환
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    return new Response(`Token exchange failed: ${text}`, { status: 502 })
  }

  const { access_token, expires_in } = await tokenRes.json()
  const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString()

  // 개인 URN 조회
  const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!profileRes.ok) {
    return new Response('Failed to fetch profile', { status: 502 })
  }

  const profile = await profileRes.json()
  const personUrn = `urn:li:person:${profile.sub}`

  // DB에 저장
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { db: { schema: 'gennyoon' } }
  )

  await supabase.from('linkedin_tokens').upsert({
    id: 1,
    access_token,
    person_urn: personUrn,
    expires_at: expiresAt,
  })

  return new Response(
    `<html><body style="font-family:sans-serif;padding:40px;background:#09090b;color:#e4e4e7">
      <h2 style="color:#34d399">LinkedIn 연동 완료</h2>
      <p>Person URN: <code>${personUrn}</code></p>
      <p>만료: ${expiresAt}</p>
      <p>이 탭을 닫고 어드민으로 돌아가세요.</p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
})
