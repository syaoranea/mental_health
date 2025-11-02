
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { SharePageClient } from '@/components/share-page-client'

export default async function SharePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/entrar')
  }

  return <SharePageClient />
}
