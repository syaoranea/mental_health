import { NextResponse } from 'next/server'
import { signIn } from '@/lib/cognito'

const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    const { session } = await signIn(email, password)

    const idToken = session.getIdToken().getJwtToken()
    const accessToken = session.getAccessToken().getJwtToken()
    const refreshToken = session.getRefreshToken().getToken()

    const res = NextResponse.json({ ok: true })
    res.cookies.set('id_token', idToken, { ...cookieBase, maxAge: 60 * 60 })          // 1h
    res.cookies.set('access_token', accessToken, { ...cookieBase, maxAge: 60 * 60 })  // 1h
    res.cookies.set('refresh_token', refreshToken, { ...cookieBase, maxAge: 60 * 60 * 24 * 30 }) // 30d
    res.cookies.set('user_email', email, { ...cookieBase, maxAge: 60 * 60 * 24 * 30 })            // p/ refresh

    return res
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Login failed' }, { status: 401 })
  }
}
