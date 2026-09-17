import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Contrato do job `refresh-google-reviews`: busca nota/avaliações via
 * Places API (usando `site_settings.google_place_id`) e grava em
 * `google_reviews_cache`. O site lê só o cache.
 *
 * Requer GOOGLE_PLACES_API_KEY nas env vars — ainda não configurado.
 */
export async function refreshGoogleReviews(
  supabase: SupabaseClient
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return { ok: false, error: 'CONFIG_MISSING: GOOGLE_PLACES_API_KEY' }
  }

  const { data: settingsRows, error: settingsErr } = await supabase
    .from('site_settings')
    .select('google_place_id')
    .limit(1)
  if (settingsErr) return { ok: false, error: `DATABASE_ERROR: ${settingsErr.message}` }

  const placeId = settingsRows?.[0]?.google_place_id
  if (!placeId) {
    return { ok: false, error: 'CONFIG_MISSING: site_settings.google_place_id' }
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,reviews&key=${apiKey}`
  const res = await fetch(url)
  const json = await res.json()
  if (!res.ok || json.status !== 'OK') {
    return { ok: false, error: `GOOGLE_API_ERROR: ${JSON.stringify(json)}` }
  }

  const result = json.result ?? {}
  const { error } = await supabase.from('google_reviews_cache').insert({
    rating: result.rating ?? null,
    reviews_count: result.user_ratings_total ?? null,
    reviews: result.reviews ?? [],
  })
  if (error) return { ok: false, error: `DATABASE_ERROR: ${error.message}` }

  return { ok: true }
}
