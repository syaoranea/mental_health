
import { redirect } from 'next/navigation'
import { CalendarPageClient } from '@/components/calendar-page-client'
import { fetchAuthSession } from 'aws-amplify/auth'

export default async function CalendarPage() {
  const { tokens } = await fetchAuthSession()
  const idToken = tokens?.idToken?.toString()
  if (!idToken) throw new Error('sem token')
  

  if (!idToken) {
    redirect('/auth/entrar')
  }

  return <CalendarPageClient />
}
