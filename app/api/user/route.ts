// app/api/user/route.ts
import { NextRequest } from 'next/server';
import { parseCognitoIdToken } from '@/lib/cognito-token';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return Response.json(
        { authenticated: false, user: null },
        { status: 401 },
      );
    }

    const idToken = auth.slice('Bearer '.length).trim();
    const user = parseCognitoIdToken(idToken);

    if (!user) {
      return Response.json(
        { authenticated: false, user: null },
        { status: 401 },
      );
    }

    return Response.json(
      {
        authenticated: true,
        user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Erro em /api/user:', error);
    return Response.json(
      { authenticated: false, user: null },
      { status: 500 },
    );
  }
}