import type { Metadata } from 'next'
import Script from 'next/script'
import { redirect } from 'next/navigation'
import { ACTIVE_VERSION } from '@/config/site'
import { CouponProvider } from '@/components/site/CouponModal'
import { SiteFooter } from '@/components/site/SiteFooter'
import { BottomNav } from '@/components/site/BottomNav'
import './site.css'

export const metadata: Metadata = {
  title: 'O Empório — Comfort Food & Craft Beer',
  description: 'Craft Beer | Comfort Food | Ericeira – Portugal',
}

/**
 * Root layout da NOVA versão (v2). Totalmente isolado da v1:
 * fontes, CSS e <html> próprios.
 *
 * Gate: enquanto ACTIVE_VERSION !== 'v2', toda a v2 redireciona para /v1
 * (versão atual). Troque a flag em src/config/site.ts quando estiver pronta.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  if (ACTIVE_VERSION !== 'v2') {
    redirect('/v1')
  }

  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Work+Sans:ital,wght@0,400;0,500;0,600;0,700;1,500&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CouponProvider>
          {children}
          <SiteFooter />
          <BottomNav />
        </CouponProvider>
        <Script
          src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
