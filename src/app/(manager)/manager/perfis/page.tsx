'use client'

import { useState } from 'react'
import { useManager } from '@/lib/manager/store'
import { useConfirm } from '@/lib/manager/confirm'
import { fmtDate, type Role } from '@/lib/manager/mock'
import { useToast } from '@/lib/manager/toast'
import { PageHeader, Badge, Modal, Field, inputCls, btn, Restricted } from '@/components/manager/ui'

export default function PerfisPage() {
  const { data, role, inviteProfile, changeProfileRole, toggleProfileActive } = useManager()
  const confirm = useConfirm()
  const [inviting, setInviting] = useState(false)

  if (role !== 'owner') return <Restricted />

  return (
    <div>
      <PageHeader
        title="Gestão de Perfis"
        subtitle="Apenas Owner · convidar, alterar papel, ativar/desativar"
        actions={
          <button className={btn('primary')} onClick={() => setInviting(true)}>
            + Convidar
          </button>
        }
      />

      <div className="bg-surface border border-g200 overflow-x-auto mgr-scroll">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="font-display text-[11px] tracking-wider text-g500 text-left border-b border-g200">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Ativo</th>
              <th className="px-4 py-3">Último acesso</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.profiles.map((p) => (
              <tr key={p.id} className="border-b border-g200 last:border-0 hover:bg-subtle">
                <td className="px-4 py-3 text-ink">{p.name}</td>
                <td className="px-4 py-3 text-g600">{p.email}</td>
                <td className="px-4 py-3">
                  <Badge tone={p.role === 'owner' ? 'ink' : 'outline'}>
                    {p.role === 'owner' ? 'Owner' : 'Staff'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={p.is_active ? 'ok' : 'muted'}>{p.is_active ? 'Ativo' : 'Inativo'}</Badge>
                </td>
                <td className="px-4 py-3 text-g600">{fmtDate(p.last_login_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      className={btn('ghost')}
                      onClick={() => changeProfileRole(p.id, p.role === 'owner' ? 'staff' : 'owner')}
                    >
                      {p.role === 'owner' ? '→ Staff' : '→ Owner'}
                    </button>
                    <button
                      className={btn(p.is_active ? 'danger' : 'ghost')}
                      onClick={async () => {
                        if (
                          !p.is_active ||
                          (await confirm({
                            title: 'Desativar perfil',
                            message: `Desativar o acesso de ${p.name}? A pessoa perde o acesso ao Manager até ser reativada.`,
                            confirmLabel: 'Desativar',
                            tone: 'danger',
                          }))
                        )
                          toggleProfileActive(p.id)
                      }}
                    >
                      {p.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-g500 mt-3">
        Regra de proteção: não é possível rebaixar nem desativar o último Owner ativo.
      </p>

      {inviting && <InviteModal onClose={() => setInviting(false)} onInvite={inviteProfile} />}
    </div>
  )
}

function InviteModal({
  onClose,
  onInvite,
}: {
  onClose: () => void
  onInvite: (name: string, email: string, role: Role) => void
}) {
  const toast = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('staff')

  function submit() {
    if (!name.trim() || !email.trim()) {
      toast('Nome e e-mail são obrigatórios.', 'danger')
      return
    }
    onInvite(name, email, role)
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Convidar membro">
      <div className="space-y-3">
        <Field label="Nome">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="E-mail">
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Papel">
          <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="staff">Staff</option>
            <option value="owner">Owner</option>
          </select>
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-g200">
        <button className={btn('ghost')} onClick={onClose}>Cancelar</button>
        <button className={btn('primary')} onClick={submit}>Enviar convite</button>
      </div>
    </Modal>
  )
}
