'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

/**
 * Casca do Manager: sidebar + topbar. A tela de login (/manager/login)
 * é renderizada sem a casca.
 */
export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/manager/login') return <>{children}</>

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 mgr-scroll px-7 py-7">{children}</main>
      </div>
    </div>
  )
}
