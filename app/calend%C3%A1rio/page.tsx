// app/calendário/page.tsx
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { CalendarPageClient } from '@/components/calendar-page-client'
import { fetchAuthSession } from 'aws-amplify/auth'

export default async function CalendarPage() {
  try {
    const { tokens } = await fetchAuthSession()
    const idToken = tokens?.idToken?.toString()

    if (!idToken) {
      redirect('/auth/entrar')
    }
  } catch (e) {
    // No build não tem cookies/session, então vai cair aqui.
    // Não lançar erro: só rende a página “neutra” e o client faz o resto.
    console.warn('Calendário sem sessão durante build/SSR, seguindo sem redirect.')
  }

  return <CalendarPageClient />
}