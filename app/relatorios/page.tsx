
import { redirect } from 'next/navigation'
import { ReportsPageClient } from '@/components/reports-page-client'
import { getFetchUserAttr } from '@/lib/amplify-utils/runWithAmplifyServerContext'

export default async function ReportsPage() {
  const session = await getFetchUserAttr()

  if (!session) {
    redirect('/auth/entrar')
  }

  return <ReportsPageClient />
}
