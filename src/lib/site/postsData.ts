import { createPublicClient } from '@/lib/supabase/server'
import type { Post, PostBody } from './posts'

/**
 * Ponte entre o schema do Supabase (posts/post_categories) e o shape `Post`
 * que os componentes do site já consumiam (PostCard, NovidadesList, a
 * página de detalhe) — assim eles não precisaram mudar, só passaram a
 * receber dados reais em vez do array estático.
 */
function toBody(blocks: any[] | null): PostBody[] {
  return (blocks ?? []).map((b) => {
    if (b.type === 'heading') return `## ${b.text_pt}`
    if (b.type === 'paragraph') return b.text_pt
    if (b.type === 'video') return { video: b.youtube }
    if (b.type === 'gallery') return { gallery: b.images ?? [] }
    return ''
  })
}

export async function getPublishedPosts(): Promise<Post[]> {
  const supabase = createPublicClient()
  const [{ data: posts }, { data: categories }] = await Promise.all([
    supabase.from('posts').select('*').eq('status', 'published').order('published_at', { ascending: false }),
    supabase.from('post_categories').select('id, label_pt'),
  ])
  const catLabel = new Map((categories ?? []).map((c) => [c.id, c.label_pt as string]))

  return (posts ?? []).map((p) => ({
    slug: p.slug,
    eyebrow: p.eyebrow_pt,
    cat: (p.category_id && catLabel.get(p.category_id)) || '',
    titulo: p.title_pt,
    sub: p.subtitle_pt,
    data: (p.published_at ?? '').slice(0, 10),
    foto: p.cover_path,
    corpo: toBody(p.body),
  }))
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = createPublicClient()
  const { data: p } = await supabase.from('posts').select('*').eq('slug', slug).eq('status', 'published').maybeSingle()
  if (!p) return null

  let cat = ''
  if (p.category_id) {
    const { data: c } = await supabase.from('post_categories').select('label_pt').eq('id', p.category_id).maybeSingle()
    cat = c?.label_pt ?? ''
  }

  return {
    slug: p.slug,
    eyebrow: p.eyebrow_pt,
    cat,
    titulo: p.title_pt,
    sub: p.subtitle_pt,
    data: (p.published_at ?? '').slice(0, 10),
    foto: p.cover_path,
    corpo: toBody(p.body),
  }
}

export async function getPublishedSlugs(): Promise<string[]> {
  const supabase = createPublicClient()
  const { data } = await supabase.from('posts').select('slug').eq('status', 'published')
  return (data ?? []).map((p) => p.slug)
}
