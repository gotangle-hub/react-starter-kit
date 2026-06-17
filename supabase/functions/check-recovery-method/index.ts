// Public endpoint: tells the forgot-password flow whether an email signs in
// with a password or with an OAuth/institution provider. Never reveals whether
// the email exists — when there's no account, returns the same "unknown"
// shape as a password account so the UI behaviour stays private.
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return json({ error: 'email required' }, 400)
    }
    const supa = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data, error } = await supa.rpc('get_auth_methods', { p_email: email.trim() })
    if (error) {
      console.error('get_auth_methods failed', error)
      return json({ method: 'unknown', providers: [] }, 200)
    }
    const exists = !!data?.exists
    const hasPassword = !!data?.has_password
    const providers: string[] = Array.isArray(data?.providers) ? data.providers : []

    // Privacy: when the email is not registered, return the same shape as a
    // password account so the client always proceeds to the code screen.
    if (!exists) return json({ method: 'password', providers: [] }, 200)

    if (!hasPassword) {
      return json({ method: 'oauth', providers: providers.filter((p) => p !== 'email') }, 200)
    }
    return json({ method: 'password', providers }, 200)
  } catch (e) {
    console.error('check-recovery-method error', e)
    return json({ method: 'unknown', providers: [] }, 200)
  }
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
