
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { data: session, status } = useSession() || { data: null, status: 'loading' }
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (requireAuth && !session) {
      router.push('/auth/entrar')
      return
    }

    if (!requireAuth && session) {
      router.push('/dashboard')
      return
    }
  }, [session, status, router, requireAuth])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !session) {
    return null
  }

  if (!requireAuth && session) {
    return null
  }

  return <>{children}</>
}
