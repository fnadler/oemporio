'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type ToastKind = 'ok' | 'info' | 'danger'
interface Toast {
  id: number
  msg: string
  kind: ToastKind
}

const ToastCtx = createContext<(msg: string, kind?: ToastKind) => void>(() => {})

export function useToast() {
  return useContext(ToastCtx)
}

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((msg: string, kind: ToastKind = 'ok') => {
    const id = ++counter
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`font-display text-sm px-4 py-3 border shadow-lg text-paper min-w-[220px] ${
              t.kind === 'ok'
                ? 'bg-ok border-ok'
                : t.kind === 'danger'
                  ? 'bg-danger border-danger'
                  : 'bg-ink border-ink'
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
