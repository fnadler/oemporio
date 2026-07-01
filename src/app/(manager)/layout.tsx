import type { Metadata } from 'next'
import { ToastProvider } from '@/lib/manager/toast'
import { StoreProvider } from '@/lib/manager/store'
import { ConfirmProvider } from '@/lib/manager/confirm'
import { Shell } from '@/components/manager/Shell'
import './manager.css'

export const metadata: Metadata = {
  title: 'O Empório — Manager',
  description: 'Painel administrativo (CRM) do O Empório',
}

/**
 * Root layout do Manager (CRM). Isolado da v1 e da v2 — fontes e CSS próprios.
 * Protótipo mockado: dados fictícios em memória, sem backend.
 */
export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Work+Sans:ital,wght@0,400;0,500;0,600;0,700;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>
          <StoreProvider>
            <ConfirmProvider>
              <Shell>{children}</Shell>
            </ConfirmProvider>
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
