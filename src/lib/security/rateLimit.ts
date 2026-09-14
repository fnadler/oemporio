const buckets = new Map<string, number[]>()

/**
 * Limitador em memória, por instância do processo (não distribuído entre
 * regiões/instâncias da Vercel). Serve como primeira barreira contra abuso
 * volumétrico; para limite robusto multi-instância, migrar para Upstash
 * Redis (ver Especificação Técnica do Backend, §7).
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  if (timestamps.length >= limit) {
    buckets.set(key, timestamps)
    return true
  }
  timestamps.push(now)
  buckets.set(key, timestamps)
  return false
}
