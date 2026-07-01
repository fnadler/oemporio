'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { ConfirmDialog } from '@/components/manager/ui'

type ConfirmOpts = {
  title: string
  message?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'primary' | 'danger'
}
type Pending = ConfirmOpts & { resolve: (v: boolean) => void }

const Ctx = createContext<(opts: ConfirmOpts) => Promise<boolean>>(() => Promise.resolve(false))

/** Hook de confirmação: `if (await confirm({...})) açãoDestrutiva()`. */
export function useConfirm() {
  return useContext(Ctx)
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null)

  const confirm = useCallback(
    (opts: ConfirmOpts) => new Promise<boolean>((resolve) => setPending({ ...opts, resolve })),
    [],
  )

  const settle = (v: boolean) => {
    if (pending) pending.resolve(v)
    setPending(null)
  }

  return (
    <Ctx.Provider value={confirm}>
      {children}
      {pending && (
        <ConfirmDialog
          open
          title={pending.title}
          message={pending.message}
          confirmLabel={pending.confirmLabel}
          cancelLabel={pending.cancelLabel}
          tone={pending.tone}
          onConfirm={() => settle(true)}
          onClose={() => settle(false)}
        />
      )}
    </Ctx.Provider>
  )
}
