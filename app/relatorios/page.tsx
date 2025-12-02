
import { redirect } from 'next/navigation'
import { ReportsPageClient } from '@/components/reports-page-client'

export default async function ReportsPage() {

/*   if (!session) {
    redirect('/auth/entrar')
  } */

  return <ReportsPageClient />
}
