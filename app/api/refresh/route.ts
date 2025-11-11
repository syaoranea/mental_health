// src/app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server'

const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

/* export async function POST() {
  try {
    // pegamos email e refresh dos cookies
    const headers = new Headers()
    // Next 14: use cookies() de 'next/headers' se preferir; aqui por simplicidade lê do request em middleware.
    // Melhor abordagem:
    // const cookieStore = cookies()
    // const email = cookieStore.get('user_email')?.value
    // const refresh = cookieStore.get('refresh_token')?.value
    // Como estamos no handler padrão, use 'cookies' compatível:
    // (Ajuste caso sua versão do Next requeira import explícito.)

    // Exemplo usando Next 13+:
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const email = cookieStore.get('user_email')?.value
    const refresh = cookieStore.get('refresh_token')?.value

    if (!email || !refresh) {
      return NextResponse.json({ ok: false, error: 'Missing refresh' }, { status: 401 })
    }

    const session = await refreshSession(email, refresh)

    const idToken = session.getIdToken().getJwtToken()
    const accessToken = session.getAccessToken().getJwtToken()

    const res = NextResponse.json({ ok: true })
    res.cookies.set('id_token', idToken, { ...cookieBase, maxAge: 60 * 60 })
    res.cookies.set('access_token', accessToken, { ...cookieBase, maxAge: 60 * 60 })
    return res
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Refresh failed' }, { status: 401 })
  }
} */
