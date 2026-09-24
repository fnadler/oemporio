import type { Metadata } from 'next'
import { NovidadesList } from '@/components/site/NovidadesList'
import { getPublishedPosts } from '@/lib/site/postsData'

export const metadata: Metadata = {
  title: 'O Empório — Novidades',
}

export const revalidate = 60

export default async function NovidadesPage() {
  const posts = await getPublishedPosts()
  return <NovidadesList posts={posts} />
}
