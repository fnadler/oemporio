import sharp from 'sharp'
import type { SupabaseClient } from '@supabase/supabase-js'

const MAX_WIDTH = 1600
const WEBP_QUALITY = 82
const MAX_INPUT_BYTES = 8 * 1024 * 1024 // 8MB — mesmo limite do bucket

const ALLOWED_FOLDERS = ['menu', 'posts'] as const
export type UploadFolder = (typeof ALLOWED_FOLDERS)[number]

export function isValidFolder(folder: string): folder is UploadFolder {
  return (ALLOWED_FOLDERS as readonly string[]).includes(folder)
}

export interface UploadResult {
  ok: true
  path: string
  url: string
}
export interface UploadError {
  ok: false
  error: string
}

/**
 * Redimensiona (máx. 1600px de largura, sem ampliar imagens menores) e
 * converte para WebP — o site usa <img> puro (sem next/image), então essa
 * é a única otimização de formato/tamanho que as fotos recebem. Feito uma
 * vez no upload, não a cada visualização.
 */
export async function processAndUploadImage(
  supabase: SupabaseClient,
  folder: UploadFolder,
  bytes: ArrayBuffer
): Promise<UploadResult | UploadError> {
  if (bytes.byteLength > MAX_INPUT_BYTES) {
    return { ok: false, error: 'FILE_TOO_LARGE' }
  }

  let webp: Buffer
  try {
    webp = await sharp(Buffer.from(bytes))
      .rotate() // aplica a orientação EXIF antes de descartá-la
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()
  } catch {
    return { ok: false, error: 'INVALID_IMAGE' }
  }

  const path = `${folder}/${crypto.randomUUID()}.webp`
  const { error } = await supabase.storage.from('media').upload(path, webp, {
    contentType: 'image/webp',
    cacheControl: '31536000', // 1 ano — o nome do arquivo já é único (uuid), nunca reaproveitado
  })
  if (error) return { ok: false, error: error.message }

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return { ok: true, path, url: data.publicUrl }
}

/** Apaga uma imagem antiga do bucket ao substituí-la — nunca falha o fluxo principal. */
export async function deleteImageIfOwned(supabase: SupabaseClient, publicUrl: string | null | undefined) {
  if (!publicUrl) return
  const marker = '/storage/v1/object/public/media/'
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return // não é um arquivo nosso (ex.: /v2/img/... semeado) — não mexe
  const path = publicUrl.slice(idx + marker.length)
  await supabase.storage.from('media').remove([path]).catch(() => {})
}
