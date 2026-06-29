import type { Metadata } from 'next'
import { NovidadesList } from '@/components/site/NovidadesList'

export const metadata: Metadata = {
  title: 'O Empório — Novidades',
}

export default function NovidadesPage() {
  return <NovidadesList />
}
