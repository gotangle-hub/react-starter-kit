// Shared helper: verify a caller JWT is the project's service_role.
// Mirrors the pattern used in process-email-queue.

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

/** Returns true if the Authorization header carries a service_role JWT. */
export function isServiceRole(req: Request): boolean {
  const header = req.headers.get('Authorization') ?? ''
  if (!header.startsWith('Bearer ')) return false
  const claims = parseJwtClaims(header.slice('Bearer '.length).trim())
  return claims?.role === 'service_role'
}
