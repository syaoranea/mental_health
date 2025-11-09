import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  const opts = { httpOnly: true, path: '/' }
  res.cookies.set('id_token', '', { ...opts, maxAge: 0 })
  res.cookies.set('access_token', '', { ...opts, maxAge: 0 })
  res.cookies.set('refresh_token', '', { ...opts, maxAge: 0 })
  res.cookies.set('user_email', '', { ...opts, maxAge: 0 })
  return res
}

