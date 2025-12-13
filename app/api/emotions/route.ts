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

const TABLE_NAME = 'customEmotions'

// ────────────────────────────────────── utils
function getUserId(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const idToken = auth.slice('Bearer '.length).trim()
  const user = parseCognitoIdToken(idToken)
  return (user as any)?.username ?? (user as any)?.sub ?? null
}

// ────────────────────────────────────── GET  → lista emoções (pré-definidas + do usuário)
export async function GET(req: NextRequest) {
  try {
    console.log('🔎 [emotions] GET chamado')

    const userId = getUserId(req)

    const result = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    )

    const items = (result.Items || []) as any[]
    console.log('🔎 [emotions] Total itens na tabela:', items.length)

    // Emoções globais (userId = undefined ou 'global')
    const globais = items.filter((it) => !it.userId || it.userId === 'global')
    const personalizados =
      userId != null ? items.filter((it) => it.userId === userId) : []

    // Ordenar por order, depois por label
    const ordered = [...globais, ...personalizados].sort((a, b) => {
      const ao = a.order ?? 999999
      const bo = b.order ?? 999999
      if (ao !== bo) return ao - bo
      return (a.label ?? '').localeCompare(b.label ?? '', 'pt-BR', {
        sensitivity: 'base',
      })
    })

    const emotions = ordered.map((it) => ({
      emotionId: it.emotionId as string,
      id: (it.emotionId as string) ?? (it.id as string),
      emoji: (it.emoji as string) ?? '😊',
      label: it.label as string,
      value: it.value as string,
      order: it.order as number | undefined,
      type: (it.type as 'predefined' | 'custom') ?? 'custom',
      isCustom: it.isCustom ?? (it.userId && it.userId !== 'global'),
    }))

    console.log('🔎 [emotions] emotions retornadas:', emotions)

    return Response.json({ success: true, emotions }, { status: 200 })
  } catch (error) {
    console.error('❌ [emotions] Erro GET:', error)
    return Response.json(
      { success: false, error: 'Erro ao buscar emoções' },
      { status: 500 }
    )
  }
}

// ────────────────────────────────────── POST → adicionar emoção customizada
export async function POST(req: NextRequest) {
  try {
    console.log('🔎 [emotions] POST chamado')

    const userId = getUserId(req)
    if (!userId) {
      console.log('⚠️ [emotions] POST sem userId (não autenticado)')
      return Response.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('🔎 [emotions] POST body:', body)

    const emoji = body.emoji?.trim() || '😊'
    const label = body.label?.trim()
    const order: number | null =
      typeof body.order === 'number' ? body.order : null

    if (!label) {
      return Response.json(
        { success: false, error: 'label obrigatório' },
        { status: 400 }
      )
    }

    // Gerar value a partir do label (lowercase, sem acentos)
    const value = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')

    // Verificar se já existe emoção com esse label para o usuário
    const scan = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: '#uid = :uid AND #lbl = :lbl',
        ExpressionAttributeNames: {
          '#uid': 'userId',
          '#lbl': 'label',
        },
        ExpressionAttributeValues: {
          ':uid': userId,
          ':lbl': label,
        },
      })
    )

    const existing = (scan.Items || [])[0] as any | undefined
    if (existing && existing.emotionId) {
      // Já existe → Update
      const exprNames: Record<string, string> = { '#e': 'emoji' }
      const exprValues: Record<string, any> = { ':e': emoji }
      let updateExpr = 'SET #e = :e'

      if (order !== null) {
        exprNames['#o'] = 'order'
        exprValues[':o'] = order
        updateExpr += ', #o = :o'
      }

      console.log(
        '📝 [emotions] UpdateItem Key:',
        { userId, emotionId: existing.emotionId },
        'UpdateExpression:',
        updateExpr,
        'Values:',
        exprValues
      )

      await ddb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            userId,
            emotionId: existing.emotionId,
          },
          UpdateExpression: updateExpr,
          ExpressionAttributeNames: exprNames,
          ExpressionAttributeValues: exprValues,
        })
      )

      return Response.json(
        {
          success: true,
          emotion: {
            id: existing.emotionId,
            emoji,
            label,
            value: existing.value,
            order: order ?? existing.order,
            type: 'custom' as const,
            isCustom: true,
          },
        },
        { status: 200 }
      )
    }

    // Não existe → criar novo
    const emotionId = crypto.randomUUID()

    const item: any = {
      userId,
      emotionId,
      emoji,
      label,
      value,
      type: 'custom',
      isCustom: true,
    }
    if (order !== null) {
      item.order = order
    }

    console.log('📝 [emotions] PutItem Item (novo):', item)

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    )

    console.log('✅ [emotions] Emoção criada com sucesso')
    return Response.json(
      {
        success: true,
        emotion: {
          id: emotionId,
          emoji,
          label,
          value,
          order,
          type: 'custom' as const,
          isCustom: true,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ [emotions] Erro POST:', error)
    return Response.json(
      { success: false, error: 'Erro ao adicionar emoção' },
      { status: 500 }
    )
  }
}

// ────────────────────────────────────── PUT → editar emoção (emoji / label / order)
export async function PUT(req: NextRequest) {
  try {
    console.log('🔎 [emotions] PUT chamado')

    const userId = getUserId(req)
    if (!userId) {
      console.log('⚠️ [emotions] PUT sem userId (não autenticado)')
      return Response.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('🔎 [emotions] PUT body:', body)

    const emotionId = body.id as string | undefined
    const emoji = body.emoji?.trim()
    const label = body.label?.trim()
    const order: number | null =
      typeof body.order === 'number' ? body.order : null

    if (!emotionId) {
      return Response.json(
        { success: false, error: 'id obrigatório' },
        { status: 400 }
      )
    }

    const exprNames: Record<string, string> = {}
    const exprValues: Record<string, any> = {}
    let updateExpr = 'SET '
    let hasUpdate = false

    if (emoji) {
      exprNames['#e'] = 'emoji'
      exprValues[':e'] = emoji
      updateExpr += '#e = :e'
      hasUpdate = true
    }

    if (label) {
      if (hasUpdate) updateExpr += ', '
      exprNames['#l'] = 'label'
      exprValues[':l'] = label
      updateExpr += '#l = :l'
      
      // Atualizar value também
      const value = label
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
      exprNames['#v'] = 'value'
      exprValues[':v'] = value
      updateExpr += ', #v = :v'
      hasUpdate = true
    }

    if (order !== null) {
      if (hasUpdate) updateExpr += ', '
      exprNames['#o'] = 'order'
      exprValues[':o'] = order
      updateExpr += '#o = :o'
      hasUpdate = true
    }

    if (!hasUpdate) {
      return Response.json(
        { success: false, error: 'Nada para atualizar' },
        { status: 400 }
      )
    }

    console.log(
      '📝 [emotions] UpdateItem Key:',
      { userId, emotionId },
      'UpdateExpression:',
      updateExpr,
      'Values:',
      exprValues
    )

    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          userId,
          emotionId,
        },
        UpdateExpression: updateExpr,
        ExpressionAttributeNames: exprNames,
        ExpressionAttributeValues: exprValues,
      })
    )

    console.log('✅ [emotions] Emoção atualizada com sucesso')
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('❌ [emotions] Erro PUT:', error)
    return Response.json(
      { success: false, error: 'Erro ao atualizar emoção' },
      { status: 500 }
    )
  }
}

// ────────────────────────────────────── DELETE → excluir emoção
export async function DELETE(req: NextRequest) {
  try {
    console.log('🔎 [emotions] DELETE chamado')

    const userId = getUserId(req)
    if (!userId) {
      console.log('⚠️ [emotions] DELETE sem userId (não autenticado)')
      return Response.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('🔎 [emotions] DELETE body:', body)

    const emotionId = body.id as string | undefined
    if (!emotionId) {
      return Response.json(
        { success: false, error: 'id obrigatório' },
        { status: 400 }
      )
    }

    console.log('🗑️ [emotions] DeleteItem Key:', {
      userId,
      emotionId,
    })

    await ddb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          userId,
          emotionId,
        },
      })
    )

    console.log('✅ [emotions] Emoção deletada com sucesso')
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('❌ [emotions] Erro DELETE:', error)
    return Response.json(
      { success: false, error: 'Erro ao excluir emoção' },
      { status: 500 }
    )
  }
}
