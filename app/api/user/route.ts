// app/api/user/route.ts
import { NextRequest } from 'next/server'
import { parseCognitoIdToken } from '@/lib/cognito-token'

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (!auth?.startsWith('Bearer ')) {
      return Response.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const idToken = auth.slice('Bearer '.length).trim()
    const user = parseCognitoIdToken(idToken) as any

    // 👇 LOG TEMPORÁRIO PARA DEBUG
    console.log('🔍 [/api/user] Token decodificado:', JSON.stringify(user, null, 2))

    // Cognito normalmente tem: name, given_name, family_name, email, nickname, etc.
    const displayName =
      user.name ||
      user.given_name ||
      user.nickname ||
      user.email ||
      user.username ||
      user.sub

    console.log('👤 [/api/user] displayName escolhido:', displayName)

    return Response.json(
      {
        success: true,
        user: {
          id: user.sub,
          name: displayName,
          email: user.email,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ /api/user GET error:', error)
    return Response.json(
      { success: false, error: 'Erro ao buscar usuário' },
      { status: 500 }
    )
  }
}