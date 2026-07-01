'use client'

import { useEffect, useRef, useState } from 'react'
import { useManager } from '@/lib/manager/store'
import { useToast } from '@/lib/manager/toast'
import { useConfirm } from '@/lib/manager/confirm'
import { type Post, type PostBlock, type PostCategory } from '@/lib/manager/mock'
import { Badge, Field, Select, Modal, inputCls, btn } from '@/components/manager/ui'

export function blankPost(): Post {
  return {
    id: '',
    slug: '',
    eyebrow_pt: '', eyebrow_en: '',
    category_id: '',
    title_pt: '', title_en: '',
    subtitle_pt: '', subtitle_en: '',
    status: 'draft',
    date: new Date().toISOString().slice(0, 10),
    body: [],
  }
}

/**
 * Editor de novidade (cadastro/edição) em tela cheia.
 * `onDone` é chamado após salvar ou cancelar (a página navega de volta).
 */
export function PostEditor({ initial, onDone }: { initial: Post; onDone: () => void }) {
  const { data, savePost } = useManager()
  const toast = useToast()
  const [post, setPost] = useState<Post>(initial)
  const [lang, setLang] = useState<'pt' | 'en'>('pt')
  const [managing, setManaging] = useState(false)

  const set = (patch: Partial<Post>) => setPost((p) => ({ ...p, ...patch }))

  const L = lang
  const field = (key: 'eyebrow' | 'title' | 'subtitle') => `${key}_${L}` as keyof Post

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
    savePost({ ...post, slug, status: 'published' })
    onDone()
  }

  return (
    <div>
      <div className="bg-surface border border-g200 p-6">
        {/* abas de idioma — PT e EN preenchidos manualmente */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex border border-g300">
            {(['pt', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`font-display text-xs tracking-wider min-h-11 px-4 transition-colors ${
                  lang === l ? 'bg-ink text-paper' : 'bg-surface text-g600 hover:text-ink'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="text-xs text-g500">Preencha o conteúdo em PT e em EN.</span>
        </div>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={`Eyebrow (${L.toUpperCase()})`}>
              <input
                className={inputCls}
                value={String(post[field('eyebrow')] ?? '')}
                onChange={(e) => set({ [field('eyebrow')]: e.target.value } as Partial<Post>)}
              />
            </Field>
            <Field label="Categoria">
              <div className="flex gap-2">
                <Select
                  className="flex-1"
                  value={post.category_id}
                  onChange={(e) => set({ category_id: e.target.value })}
                  aria-label="Categoria"
                >
                  <option value="">— Selecione —</option>
                  {data.postCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {L === 'pt' ? c.label_pt : c.label_en}
                    </option>
                  ))}
                </Select>
                <button
                  type="button"
                  onClick={() => setManaging(true)}
                  aria-label="Gerenciar categorias"
                  title="Gerenciar categorias"
                  className="shrink-0 px-3 border border-g300 bg-surface text-ink hover:border-ink transition-colors flex items-center justify-center"
                >
                  <GearIcon />
                </button>
              </div>
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
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Data">
              <input
                type="date"
                className={inputCls}
                value={post.date}
                onChange={(e) => set({ date: e.target.value })}
              />
            </Field>
            <Field label="Imagem de capa">
              <button
                type="button"
                className={`${btn('ghost')} w-full`}
                onClick={() => toast('Upload simulado.', 'info')}
              >
                ⬆ Carregar (mock)
              </button>
            </Field>
          </div>

          {/* blocos do corpo */}
          <div className="border-t border-g200 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="font-display text-[11px] tracking-wider text-g500">Corpo</span>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" className={btn('ghost')} onClick={() => addBlock('paragraph')}>+ Parágrafo</button>
                <button type="button" className={btn('ghost')} onClick={() => addBlock('heading')}>+ Subtítulo</button>
                <button type="button" className={btn('ghost')} onClick={() => addBlock('video')}>+ Vídeo</button>
                <button type="button" className={btn('ghost')} onClick={() => addBlock('gallery')}>+ Galeria</button>
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
                      <button type="button" className="w-9 h-9 text-g500 hover:text-ink" onClick={() => moveBlock(i, -1)} aria-label="Mover para cima">↑</button>
                      <button type="button" className="w-9 h-9 text-g500 hover:text-ink" onClick={() => moveBlock(i, 1)} aria-label="Mover para baixo">↓</button>
                      <button type="button" className="w-9 h-9 text-danger" onClick={() => removeBlock(i)} aria-label="Remover bloco">✕</button>
                    </div>
                  </div>
                  {b.type === 'paragraph' && (
                    <RichTextEditor
                      key={`${i}-${L}`}
                      value={L === 'pt' ? b.text_pt : b.text_en}
                      onChange={(val) =>
                        updateBlock(i, L === 'pt' ? { text_pt: val } : { text_en: val })
                      }
                      placeholder={`Texto (${L.toUpperCase()})`}
                    />
                  )}
                  {b.type === 'heading' && (
                    <textarea
                      className={`${inputCls} h-10 resize-none`}
                      placeholder={`Texto (${L.toUpperCase()})`}
                      value={L === 'pt' ? b.text_pt : b.text_en}
                      onChange={(e) =>
                        updateBlock(i, L === 'pt' ? { text_pt: e.target.value } : { text_en: e.target.value })
                      }
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
                    <GalleryUploader
                      images={b.images}
                      onChange={(imgs) => updateBlock(i, { images: imgs })}
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
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button type="button" className={`${btn('ghost')} min-h-13`} onClick={onDone}>
          Cancelar
        </button>
        <button type="button" className={`${btn('primary')} min-h-13`} onClick={save}>
          Publicar
        </button>
      </div>

      {managing && <CategoryManager onClose={() => setManaging(false)} />}
    </div>
  )
}

/* ===== Editor WYSIWYG para parágrafos (contentEditable) ===== */
function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const savedRange = useRef<Range | null>(null)
  const [showLink, setShowLink] = useState(false)
  const [url, setUrl] = useState('')

  // injeta o HTML inicial uma vez (uncontrolled — não re-seta a cada tecla)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const emit = () => onChange(ref.current?.innerHTML ?? '')

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg)
    ref.current?.focus()
    emit()
  }

  const openLink = () => {
    const sel = window.getSelection()
    savedRange.current = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null
    setUrl('')
    setShowLink(true)
  }

  const applyLink = () => {
    const href = url.trim()
    if (!href) return
    ref.current?.focus()
    const sel = window.getSelection()
    if (savedRange.current && sel) {
      sel.removeAllRanges()
      sel.addRange(savedRange.current)
    }
    const r = savedRange.current
    if (r && !r.collapsed) {
      document.execCommand('createLink', false, href)
    } else {
      document.execCommand('insertHTML', false, `<a href="${href}">${href}</a>`)
    }
    emit()
    setShowLink(false)
  }

  // preventDefault no mousedown mantém a seleção dentro do editor ao clicar no botão
  const hold = (e: React.MouseEvent) => e.preventDefault()
  const tbtn =
    'min-w-9 h-9 px-2 border border-g300 bg-surface text-ink hover:border-ink transition-colors text-sm'

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        <button type="button" className={`${tbtn} font-bold`} title="Negrito" onMouseDown={hold} onClick={() => exec('bold')}>
          B
        </button>
        <button type="button" className={`${tbtn} italic`} title="Itálico" onMouseDown={hold} onClick={() => exec('italic')}>
          I
        </button>
        <button type="button" className={tbtn} title="Lista com marcadores" onMouseDown={hold} onClick={() => exec('insertUnorderedList')}>
          • Lista
        </button>
        <button type="button" className={tbtn} title="Link" onMouseDown={hold} onClick={openLink}>
          🔗 Link
        </button>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-ph={placeholder}
        onInput={emit}
        className="min-h-20 border border-g300 bg-surface px-3 py-2.5 text-sm text-ink leading-relaxed outline-none focus:border-ink whitespace-pre-wrap [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:underline [&_a]:text-ink empty:before:content-[attr(data-ph)] empty:before:text-g400 empty:before:pointer-events-none"
      />

      {showLink && (
        <Modal open onClose={() => setShowLink(false)} title="Inserir link">
          <Field label="URL">
            <input
              autoFocus
              className={inputCls}
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyLink()}
            />
          </Field>
          <div className="flex justify-end gap-2 mt-5">
            <button type="button" className={btn('ghost')} onClick={() => setShowLink(false)}>
              Cancelar
            </button>
            <button type="button" className={btn('primary')} disabled={!url.trim()} onClick={applyLink}>
              Inserir
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ===== Galeria com upload múltiplo (mock) ===== */
function GalleryUploader({
  images,
  onChange,
}: {
  images: string[]
  onChange: (imgs: string[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length) onChange([...images, ...files.map((f) => URL.createObjectURL(f))])
    e.target.value = '' // permite reenviar os mesmos arquivos
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
      <button type="button" className={btn('ghost')} onClick={() => inputRef.current?.click()}>
        ⬆ Adicionar imagens
      </button>
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
          {images.map((src, idx) => (
            <div key={idx} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full aspect-square object-cover border border-g200" />
              <button
                type="button"
                onClick={() => onChange(images.filter((_, i) => i !== idx))}
                aria-label="Remover imagem"
                className="absolute top-1 right-1 w-7 h-7 bg-ink2/80 text-paper text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ===== Modal de gestão de categorias ===== */
function CategoryManager({ onClose }: { onClose: () => void }) {
  const { data, savePostCategory, deletePostCategory } = useManager()
  const confirm = useConfirm()
  const [editId, setEditId] = useState<string | null>(null)
  const [pt, setPt] = useState('')
  const [en, setEn] = useState('')

  const startEdit = (c: PostCategory) => {
    setEditId(c.id)
    setPt(c.label_pt)
    setEn(c.label_en)
  }
  const reset = () => {
    setEditId(null)
    setPt('')
    setEn('')
  }
  const submit = () => {
    if (!pt.trim()) return
    const id = editId ?? `catnews-${Math.random().toString(36).slice(2, 8)}`
    savePostCategory({ id, label_pt: pt.trim(), label_en: en.trim() || pt.trim() })
    reset()
  }

  return (
    <Modal open onClose={onClose} title="Gerenciar categorias">
      <div className="space-y-1.5 mb-5">
        {data.postCategories.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-3 border border-g200 px-3 py-2"
          >
            <div className="text-sm text-ink">
              {c.label_pt} <span className="text-g500">· {c.label_en}</span>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button type="button" className={btn('ghost')} onClick={() => startEdit(c)}>
                Editar
              </button>
              <button
                type="button"
                className={btn('danger')}
                onClick={async () => {
                  if (
                    await confirm({
                      title: 'Excluir categoria',
                      message: `Excluir a categoria “${c.label_pt}”? Novidades vinculadas ficarão sem categoria.`,
                      confirmLabel: 'Excluir',
                      tone: 'danger',
                    })
                  )
                    deletePostCategory(c.id)
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
        {data.postCategories.length === 0 && (
          <p className="text-sm text-g500">Nenhuma categoria cadastrada.</p>
        )}
      </div>

      <div className="border-t border-g200 pt-4">
        <div className="font-display text-[11px] tracking-wider text-g500 mb-2">
          {editId ? 'Editar categoria' : 'Nova categoria'}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input className={inputCls} placeholder="Nome (PT)" value={pt} onChange={(e) => setPt(e.target.value)} />
          <input className={inputCls} placeholder="Nome (EN)" value={en} onChange={(e) => setEn(e.target.value)} />
        </div>
        <div className="flex gap-2 mt-3">
          <button type="button" className={btn('primary')} disabled={!pt.trim()} onClick={submit}>
            {editId ? 'Salvar' : '+ Adicionar'}
          </button>
          {editId && (
            <button type="button" className={btn('ghost')} onClick={reset}>
              Cancelar edição
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
