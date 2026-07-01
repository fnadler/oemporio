'use client'

import { useRouter } from 'next/navigation'
import { useManager } from '@/lib/manager/store'
import { useConfirm } from '@/lib/manager/confirm'
import { fmtDate, postCategoryLabel } from '@/lib/manager/mock'
import { PageHeader, Badge, btn } from '@/components/manager/ui'

export default function NovidadesPage() {
  const { data, togglePublish, deletePost } = useManager()
  const confirm = useConfirm()
  const router = useRouter()

  return (
    <div>
      <PageHeader
        title="Novidades"
        subtitle={`${data.posts.length} posts`}
        actions={
          <button className={btn('primary')} onClick={() => router.push('/manager/novidades/novo')}>
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
              <tr
                key={p.id}
                onClick={() => router.push(`/manager/novidades/${p.id}`)}
                className="border-b border-g200 last:border-0 hover:bg-subtle cursor-pointer"
              >
                <td className="px-4 py-3 text-ink">{p.title_pt}</td>
                <td className="px-4 py-3 text-g600">
                  {postCategoryLabel(data.postCategories, p.category_id)}
                </td>
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
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button className={btn('ghost')} onClick={() => router.push(`/manager/novidades/${p.id}`)}>
                      Editar
                    </button>
                    <button className={btn('ghost')} onClick={() => togglePublish(p.id)}>
                      {p.status === 'published' ? 'Despublicar' : 'Publicar'}
                    </button>
                    <button
                      className={btn('danger')}
                      onClick={async () => {
                        if (
                          await confirm({
                            title: 'Apagar novidade',
                            message: `Apagar “${p.title_pt}”? Esta ação não pode ser desfeita.`,
                            confirmLabel: 'Apagar',
                            tone: 'danger',
                          })
                        )
                          deletePost(p.id)
                      }}
                    >
                      Apagar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data.posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-g500">
                  Nenhuma novidade cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
