import { NextRequest } from 'next/server'
import {
  ScanCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { ddb } from '@/lib/dynamodb'
import { parseCognitoIdToken } from '@/lib/cognito-token'
import crypto from 'crypto'

// ────────────────────────────────────── utils
function getUserId(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const idToken = auth.slice('Bearer '.length).trim()
  const user = parseCognitoIdToken(idToken)
  return (user as any)?.username ?? (user as any)?.sub ?? null
}

// ────────────────────────────────────── GET  → lista
export async function GET(req: NextRequest) {
  try {
    console.log('🔎 [mood-words] GET chamado')

    const userId = getUserId(req)

    const result = await ddb.send(
      new ScanCommand({
        TableName: 'EmotionDescriptors',
      })
    )

    const items = (result.Items || []) as any[]
    console.log('🔎 [mood-words] Total itens na tabela:', items.length)

    const globais = items.filter((it) => it.userId === undefined)
    const personalizados =
      userId != null
        ? items.filter((it) => it.userId === userId)
        : []

    const ordered = [...globais, ...personalizados].sort((a, b) => {
      const ao = a.order ?? 999999
      const bo = b.order ?? 999999
      if (ao !== bo) return ao - bo
      return (a.text ?? '').localeCompare(b.text ?? '', 'pt-BR', { sensitivity: 'base' })
    })

    const words = ordered.map((it) => it.text ?? it.name ?? 'sem texto')

    console.log('🔎 [mood-words] words retornadas:', words)

    return Response.json({ success: true, words }, { status: 200 })
  } catch (error) {
    console.error('❌ [mood-words] Erro GET:', error)
    return Response.json(
      { success: false, error: 'Erro ao buscar palavras' },
      { status: 500 }
    )
  }
}

// ────────────────────────────────────── POST → adicionar
// app/api/mood-words/route.ts (apenas o POST)
export async function POST(req: NextRequest) {
  try {
    console.log('🔎 [mood-words] POST chamado')

    const userId = getUserId(req)
    if (!userId) {
      console.log('⚠️ [mood-words] POST sem userId (não autenticado)')
      return Response.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('🔎 [mood-words] POST body:', body)

    const text = body.text?.trim()
    const order: number | null =
      typeof body.order === 'number' ? body.order : null

    if (!text) {
      return Response.json(
        { success: false, error: 'text obrigatório' },
        { status: 400 }
      )
    }

    // 1) Procurar se já existe item desse usuário com esse text
    const scan = await ddb.send(
      new ScanCommand({
        TableName: 'EmotionDescriptors',
        FilterExpression: '#uid = :uid AND #txt = :txt',
        ExpressionAttributeNames: {
          '#uid': 'userId',
          '#txt': 'text',
        },
        ExpressionAttributeValues: {
          ':uid': userId,
          ':txt': text,
        },
      })
    )

    const existing = (scan.Items || [])[0] as any | undefined
    console.log('🔎 [mood-words] existing item for user+text:', existing)

    if (existing && existing.descriptorId) {
      // 2a) Já existe → Update pelo par (userId, descriptorId)
      const exprNames: Record<string, string> = { '#t': 'text' }
      const exprValues: Record<string, any> = { ':t': text }
      let updateExpr = 'SET #t = :t'

      if (order !== null) {
        exprNames['#o'] = 'order'
        exprValues[':o'] = order
        updateExpr += ', #o = :o'
      }

      console.log(
        '📝 [mood-words] UpdateItem Key:',
        { userId, descriptorId: existing.descriptorId }, // ← AQUI: ambos userId e descriptorId
        'UpdateExpression:',
        updateExpr,
        'Values:',
        exprValues
      )

      await ddb.send(
        new UpdateCommand({
          TableName: 'EmotionDescriptors',
          Key: {
            userId,                      // ← PK
            descriptorId: existing.descriptorId, // ← SK
          },
          UpdateExpression: updateExpr,
          ExpressionAttributeNames: exprNames,
          ExpressionAttributeValues: exprValues,
        })
      )
    } else {
      // 2b) Não existe → criar novo item com novo descriptorId
      const descriptorId = crypto.randomUUID()

      const item: any = {
        userId,
        descriptorId,
        text,
      }
      if (order !== null) {
        item.order = order
      }

      console.log('📝 [mood-words] PutItem Item (novo):', item)

      await ddb.send(
        new PutCommand({
          TableName: 'EmotionDescriptors',
          Item: item,
        })
      )
    }

    console.log('✅ [mood-words] Palavra salva/atualizada com sucesso')
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('❌ [mood-words] Erro POST:', error)
    return Response.json(
      { success: false, error: 'Erro ao adicionar/atualizar palavra' },
      { status: 500 }
    )
  }
}

// ────────────────────────────────────── PATCH → editar
export async function PATCH(req: NextRequest) {
  const userId = getUserId(req)
  if (!userId)
    return Response.json({ success: false, error: 'Unauthenticated' }, { status: 401 })

  const { oldText, newText } = await req.json()
  if (!oldText || !newText)
    return Response.json({ success: false, error: 'oldText/newText required' }, { status: 400 })

  await ddb.send(
    new UpdateCommand({
      TableName: 'EmotionDescriptors',
      Key: { userId, text: oldText },
      UpdateExpression: 'SET #t = :newText',
      ExpressionAttributeNames: { '#t': 'text' },
      ExpressionAttributeValues: { ':newText': newText.trim() },
    })
  )

  return Response.json({ success: true })
}

// ────────────────────────────────────── DELETE → excluir
export async function DELETE(req: NextRequest) {
  try {
    console.log('🔎 [mood-words] DELETE chamado')

    const userId = getUserId(req)
    if (!userId) {
      console.log('⚠️ [mood-words] DELETE sem userId (não autenticado)')
      return Response.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('🔎 [mood-words] DELETE body:', body)

    const text = body.text
    if (!text) {
      return Response.json(
        { success: false, error: 'text obrigatório' },
        { status: 400 }
      )
    }

    // 1) Achar item por (userId, text) para obter descriptorId
    const scan = await ddb.send(
      new ScanCommand({
        TableName: 'EmotionDescriptors',
        FilterExpression: '#uid = :uid AND #txt = :txt',
        ExpressionAttributeNames: {
          '#uid': 'userId',
          '#txt': 'text',
        },
        ExpressionAttributeValues: {
          ':uid': userId,
          ':txt': text,
        },
      })
    )

    const existing = (scan.Items || [])[0] as any | undefined
    console.log('🔎 [mood-words] existing to delete:', existing)

    if (!existing || !existing.descriptorId) {
      console.log('⚠️ [mood-words] Nada para deletar (não encontrado)')
      return Response.json({ success: true }, { status: 200 })
    }

    console.log('🗑️ [mood-words] DeleteItem Key:', {
      userId,
      descriptorId: existing.descriptorId,
    })

    await ddb.send(
      new DeleteCommand({
        TableName: 'EmotionDescriptors',
        Key: {
          userId,
          descriptorId: existing.descriptorId,
        },
      })
    )

    console.log('✅ [mood-words] Palavra deletada com sucesso')
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('❌ [mood-words] Erro DELETE:', error)
    return Response.json(
      { success: false, error: 'Erro ao excluir palavra' },
      { status: 500 }
    )
  }
}