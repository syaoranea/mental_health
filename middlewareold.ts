import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // lógica opcional se quiser inspecionar o req
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // permitir acesso às páginas públicas
        if (
          pathname.startsWith('/auth') || // tela de login/signup
          pathname === '/' ||              // homepage pública
          pathname.startsWith('/api/auth') // rotas de autenticação do next-auth
        ) {
          return true
        }

        // exigir token para rotas protegidas
        return !!token
      },
    },
  }
)

// ⚙️ matcher válido no Next 14: sem regex complexa, apenas prefixos
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/perfil/:path*',
    '/configuracoes/:path*',
    '/relatorios/:path*',
  ],
}

