/** Envia uma imagem para /api/manager/upload-image (resize + WebP no servidor). */
export async function uploadManagerImage(
  file: File,
  folder: 'menu' | 'posts',
  previousUrl?: string
): Promise<{ url: string } | { error: string }> {
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)
  if (previousUrl) form.append('previousUrl', previousUrl)

  const res = await fetch('/api/manager/upload-image', { method: 'POST', body: form })
  const body = await res.json()
  if (!res.ok) return { error: body.error ?? 'UPLOAD_FAILED' }
  return { url: body.url }
}
