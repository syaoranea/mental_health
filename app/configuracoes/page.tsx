
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { SettingsPageClient } from '@/components/settings-page-client'

export default async function SettingsPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect('/auth/entrar')
  }

  return <SettingsPageClient />
}
