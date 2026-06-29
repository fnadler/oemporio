'use client'

import { useState } from 'react'
import { useManager } from '@/lib/manager/store'
import { fmtDate, type Post, type PostBlock } from '@/lib/manager/mock'
import { useToast } from '@/lib/manager/toast'
import { PageHeader, Badge, Modal, Field, inputCls, btn } from '@/components/manager/ui'

function blankPost(): Post {
  return {
    id: '',
    slug: '',
    eyebrow_pt: '', eyebrow_en: '',
    category_pt: '', category_en: '',
    title_pt: '', title_en: '',
    subtitle_pt: '', subtitle_en: '',
    status: 'draft',
    date: new Date().toISOString().slice(0, 10),
    body: [],
  }
}

export default function NovidadesPage() {
  const { data, togglePublish, deletePost } = useManager()
  const [editing, setEditing] = useState<Post | null>(null)

  return (
    <div>
      <PageHeader
        title="Novidades"
        subtitle={`${data.posts.length} posts`}
        actions={
          <button className={btn('primary')} onClick={() => setEditing(blankPost())}>
            + Nova novidade
          </button>
        }
      />

      <div className="bg-surface border border-g200 overflow-x-auto mgr-scroll">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="font-display text-[11px] tracking-wider text-g500 text-left border-b border-g200">
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Idiomas</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.posts.map((p) => (
              <tr key={p.id} className="border-b border-g200 last:border-0 hover:bg-subtle">
                <td className="px-4 py-3 text-ink">{p.title_pt}</td>
                <td className="px-4 py-3 text-g600">{p.category_pt}</td>
                <td className="px-4 py-3">
                  <Badge tone="outline">PT</Badge>{' '}
                  {p.title_en ? <Badge tone="outline">EN</Badge> : <span className="text-g400 text-xs">sem EN</span>}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={p.status === 'published' ? 'ok' : 'muted'}>
                    {p.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-g600">{fmtDate(p.date)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button className={btn('ghost')} onClick={() => setEditing(structuredClone(p))}>
                      Editar
                    </button>
                    <button className={btn('ghost')} onClick={() => togglePublish(p.id)}>
                      {p.status === 'published' ? 'Despublicar' : 'Publicar'}
                    </button>
                    <button className={btn('danger')} onClick={() => deletePost(p.id)}>
                      Apagar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <PostEditor initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function PostEditor({ initial, onClose }: { initial: Post; onClose: () => void }) {
  const { savePost } = useManager()
  const toast = useToast()
  const [post, setPost] = useState<Post>(initial)
  const [lang, setLang] = useState<'pt' | 'en'>('pt')

  const set = (patch: Partial<Post>) => setPost((p) => ({ ...p, ...patch }))

  // campos bilíngues (mostra o do idioma ativo)
  const L = lang
  const field = (key: 'eyebrow' | 'category' | 'title' | 'subtitle') =>
    `${key}_${L}` as keyof Post

  function autoTranslate() {
    set({
      eyebrow_en: post.eyebrow_pt,
      category_en: post.category_pt,
      title_en: post.title_pt,
      subtitle_en: post.subtitle_pt,
      body: post.body.map((b) =>
        b.type === 'paragraph' || b.type === 'heading' ? { ...b, text_en: b.text_pt } : b,
      ),
    })
    setLang('en')
    toast('Conteúdo traduzido para EN (mock).', 'info')
  }

  function addBlock(type: PostBlock['type']) {
    const block: PostBlock =
      type === 'video'
        ? { type: 'video', youtube: '' }
        : type === 'gallery'
          ? { type: 'gallery', images: [] }
          : { type, text_pt: '', text_en: '' }
    set({ body: [...post.body, block] })
  }

  function updateBlock(i: number, patch: Partial<PostBlock>) {
    set({ body: post.body.map((b, idx) => (idx === i ? ({ ...b, ...patch } as PostBlock) : b)) })
  }

  function moveBlock(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= post.body.length) return
    const copy = [...post.body]
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    set({ body: copy })
  }

  function removeBlock(i: number) {
    set({ body: post.body.filter((_, idx) => idx !== i) })
  }

  function save() {
    if (!post.title_pt.trim()) {
      toast('Título (PT) é obrigatório.', 'danger')
      return
    }
    const slug =
      post.slug ||
      post.title_pt
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    savePost({ ...post, slug })
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={initial.id ? 'Editar novidade' : 'Nova novidade'} width="max-w-2xl">
      {/* abas de idioma */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex border border-g300">
          {(['pt', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`font-display text-xs tracking-wider px-4 py-2 ${
                lang === l ? 'bg-ink text-paper' : 'bg-surface text-g600'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <button className={btn('ghost')} onClick={autoTranslate}>
          ⇄ Traduzir PT → EN
        </button>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto mgr-scroll pr-1">
        <div className="grid grid-cols-2 gap-3">
          <Field label={`Eyebrow (${L.toUpperCase()})`}>
            <input
              className={inputCls}
              value={String(post[field('eyebrow')] ?? '')}
              onChange={(e) => set({ [field('eyebrow')]: e.target.value } as Partial<Post>)}
            />
          </Field>
          <Field label={`Categoria (${L.toUpperCase()})`}>
            <input
              className={inputCls}
              value={String(post[field('category')] ?? '')}
              onChange={(e) => set({ [field('category')]: e.target.value } as Partial<Post>)}
            />
          </Field>
        </div>
        <Field label={`Título (${L.toUpperCase()})`}>
          <input
            className={inputCls}
            value={String(post[field('title')] ?? '')}
            onChange={(e) => set({ [field('title')]: e.target.value } as Partial<Post>)}
          />
        </Field>
        <Field label={`Subheadline (${L.toUpperCase()})`}>
          <textarea
            className={`${inputCls} h-16 resize-none`}
            value={String(post[field('subtitle')] ?? '')}
            onChange={(e) => set({ [field('subtitle')]: e.target.value } as Partial<Post>)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data">
            <input
              type="date"
              className={inputCls}
              value={post.date}
              onChange={(e) => set({ date: e.target.value })}
            />
          </Field>
          <Field label="Imagem de capa">
            <button type="button" className={`${btn('ghost')} w-full justify-center`} onClick={() => toast('Upload simulado.', 'info')}>
              ⬆ Carregar (mock)
            </button>
          </Field>
        </div>

        {/* blocos do corpo */}
        <div className="border-t border-g200 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-[11px] tracking-wider text-g500">Corpo</span>
            <div className="flex gap-1.5">
              <button className={btn('ghost')} onClick={() => addBlock('paragraph')}>+ Parágrafo</button>
              <button className={btn('ghost')} onClick={() => addBlock('heading')}>+ Subtítulo</button>
              <button className={btn('ghost')} onClick={() => addBlock('video')}>+ Vídeo</button>
              <button className={btn('ghost')} onClick={() => addBlock('gallery')}>+ Galeria</button>
            </div>
          </div>

          <div className="space-y-2">
            {post.body.map((b, i) => (
              <div key={i} className="border border-g200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge tone="outline">
                    {b.type === 'paragraph' ? 'Parágrafo' : b.type === 'heading' ? 'Subtítulo' : b.type === 'video' ? 'Vídeo' : 'Galeria'}
                  </Badge>
                  <div className="flex gap-1">
                    <button className="px-2 text-g500 hover:text-ink" onClick={() => moveBlock(i, -1)}>↑</button>
                    <button className="px-2 text-g500 hover:text-ink" onClick={() => moveBlock(i, 1)}>↓</button>
                    <button className="px-2 text-danger" onClick={() => removeBlock(i)}>✕</button>
                  </div>
                </div>
                {(b.type === 'paragraph' || b.type === 'heading') && (
                  <textarea
                    className={`${inputCls} ${b.type === 'heading' ? 'h-10' : 'h-16'} resize-none`}
                    placeholder={`Texto (${L.toUpperCase()})`}
                    value={L === 'pt' ? b.text_pt : b.text_en}
                    onChange={(e) => updateBlock(i, L === 'pt' ? { text_pt: e.target.value } : { text_en: e.target.value })}
                  />
                )}
                {b.type === 'video' && (
                  <input
                    className={inputCls}
                    placeholder="ID do YouTube (ex.: aqz-KE-bpKQ)"
                    value={b.youtube}
                    onChange={(e) => updateBlock(i, { youtube: e.target.value })}
                  />
                )}
                {b.type === 'gallery' && (
                  <input
                    className={inputCls}
                    placeholder="Caminhos das imagens separados por vírgula"
                    value={b.images.join(', ')}
                    onChange={(e) => updateBlock(i, { images: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  />
                )}
              </div>
            ))}
            {post.body.length === 0 && (
              <p className="text-sm text-g500 py-2">Sem blocos. Adicione conteúdo acima.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-g200">
        <button className={btn('ghost')} onClick={onClose}>Cancelar</button>
        <button className={btn('primary')} onClick={save}>Guardar</button>
      </div>
    </Modal>
  )
}
