'use client'

import { useParams, useRouter } from 'next/navigation'
import { useManager } from '@/lib/manager/store'
import { PageHeader, btn } from '@/components/manager/ui'
import { PostEditor } from '@/components/manager/PostEditor'

export default function EditarNovidadePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data } = useManager()
  const back = () => router.push('/manager/novidades')

  const post = data.posts.find((p) => p.id === id) ?? null

  if (!post) {
    return (
      <div>
        <PageHeader title="Novidade" />
        <div className="bg-surface border border-g200 p-8 text-center">
          <p className="text-g600 text-sm">Novidade não encontrada.</p>
          <button type="button" className={`${btn('ghost')} mt-4`} onClick={back}>
            ← Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Editar novidade"
        subtitle={post.title_pt}
        actions={
          <button type="button" className={`${btn('ghost')} min-h-13`} onClick={back}>
            ← Voltar
          </button>
        }
      />
      {/* key força um editor novo ao trocar de post */}
      <PostEditor key={post.id} initial={structuredClone(post)} onDone={back} />
    </div>
  )
}
