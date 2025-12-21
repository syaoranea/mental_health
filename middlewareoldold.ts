import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas (não precisam de autenticação)
  const publicPaths = [
    '/',
    '/auth/entrar',
    '/auth/cadastrar',
    '/auth/recuperar-senha',
  ]

  // Se for rota pública, deixa passar
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Se for API route do auth, deixa passar
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Para rotas protegidas, verificar cookie do Amplify
  // O Amplify armazena tokens em cookies com padrão:
  // CognitoIdentityServiceProvider.<client_id>.<username>.idToken
  const cookies = request.cookies

  // Procurar por qualquer cookie que contenha "idToken" (indica sessão Amplify ativa)
  const hasAmplifySession = Array.from(cookies.getAll()).some(cookie => 
    cookie.name.includes('idToken') || 
    cookie.name.includes('CognitoIdentityServiceProvider')
  )

  // Se não tiver sessão Amplify, redireciona para login
  if (!hasAmplifySession) {
    const loginUrl = new URL('/auth/entrar', request.url)
    loginUrl.searchParams.set('redirect', pathname) // salva para onde voltar depois
    return NextResponse.redirect(loginUrl)
  }

  // Se tiver sessão, deixa passar
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/perfil/:path*',
    '/configuracoes/:path*',
    '/relatorios/:path*',
    '/registrar/:path*',
    '/compartilhar/:path*',
    '/emergencia/:path*',
  ],
}
