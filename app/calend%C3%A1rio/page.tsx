
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { CalendarPageClient } from '@/components/calendar-page-client'

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/entrar')
  }

  return <CalendarPageClient />
}
