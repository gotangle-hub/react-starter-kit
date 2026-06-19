// Shared helper: verify a caller is the project's service_role.
//
// SECURITY: We compare the incoming Bearer token against the actual
// SUPABASE_SERVICE_ROLE_KEY secret using a constant-time compare. We do NOT
// decode the JWT and trust the `role` claim — an unsigned token with a forged
// payload would otherwise pass that check (the verify_jwt=false admin
// functions don't have the gateway verifying the signature for us).
//
// pg_cron / the auth hook / our own edge functions call with the real service
// key, so they keep working.

export function parseJwtClaims(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const payload = parts[1]
      .replaceAll('-', '+')
      .replaceAll('_', '/')
      .padEnd(Math.ceil(parts[1].length / 4) * 4, '=')
    return JSON.parse(atob(payload)) as Record<string, unknown>
  } catch {
    return null
  }
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

/**
 * Returns true only if the Authorization header carries the project's
 * actual service_role secret (constant-time compared).
 */
export function isServiceRole(req: Request): boolean {
  const header = req.headers.get('Authorization') ?? ''
  if (!header.startsWith('Bearer ')) return false
  const token = header.slice('Bearer '.length).trim()
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!token || !key) return false
  return constantTimeEqual(token, key)
}
