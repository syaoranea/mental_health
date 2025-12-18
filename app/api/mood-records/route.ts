// app/api/mood-records/route.ts
import { NextRequest } from 'next/server'
import { PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { ddb } from '@/lib/dynamodb'
import { parseCognitoIdToken } from '@/lib/cognito-token'
import { randomBytes } from 'crypto'

const TABLE_NAME = 'registroHumor'

function getUserId(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const idToken = auth.slice('Bearer '.length).trim()
  const user = parseCognitoIdToken(idToken)
  return (user as any)?.username ?? (user as any)?.sub ?? null
}

// POST: criar novo registro
export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req)
    if (!userId) {
      return Response.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('📥 [mood-records] POST body:', body)

    const registroId = randomBytes(16).toString('hex')
    const now = new Date().toISOString()

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          userId,
          registroId,
          createdAt: now,
          timestamp: body.timestamp || now,
          sentimentos: body.sentimentos ?? [],           // array de objetos
          activities: body.activities ?? [],             // array de strings
          descriptiveWords: body.descriptiveWords ?? [], // array de strings
          notes: body.notes ?? '',
          numericScale: body.numericScale ?? null,       // 👈 número 1–10
        },
      })
    )

    console.log('✅ [mood-records] Registro criado:', registroId)

    return Response.json(
      { success: true, registroId },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ [mood-records] Erro POST:', error)
    return Response.json(
      { success: false, error: 'Erro ao criar registro' },
      { status: 500 }
    )
  }
}

// PUT: atualizar registro existente
export async function PUT(req: NextRequest) {
  try {
    const userId = getUserId(req)
    if (!userId) {
      return Response.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('📥 [mood-records] PUT body:', body)

    if (!body.registroId) {
      return Response.json(
        { success: false, error: 'registroId obrigatório' },
        { status: 400 }
      )
    }

    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          userId,
          registroId: body.registroId,
        },
        UpdateExpression: `
          SET 
            sentimentos = :sentimentos,
            activities = :activities,
            descriptiveWords = :descriptiveWords,
            notes = :notes,
            numericScale = :numericScale,
            #ts = :timestamp
        `,
        ExpressionAttributeNames: {
          '#ts': 'timestamp',
        },
        ExpressionAttributeValues: {
          ':sentimentos': body.sentimentos ?? [],
          ':activities': body.activities ?? [],
          ':descriptiveWords': body.descriptiveWords ?? [],
          ':notes': body.notes ?? '',
          ':numericScale': body.numericScale ?? null,
          ':timestamp': body.timestamp || new Date().toISOString(),
        },
      })
    )

    console.log('✅ [mood-records] Registro atualizado:', body.registroId)

    return Response.json(
      { success: true, registroId: body.registroId },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ [mood-records] Erro PUT:', error)
    return Response.json(
      { success: false, error: 'Erro ao atualizar registro' },
      { status: 500 }
    )
  }
}