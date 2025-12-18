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

// ────────────────────────────────────── GET  → lista emoções do banco (apenas)
export async function GET(req: NextRequest) {
  try {
    console.log('🔎 [emotions] GET chamado')

    const userId = getUserId(req)
    console.log('🔎 [emotions] userId:', userId)

    let items: any[] = []

    if (userId) {
      // Buscar SOMENTE emoções desse usuário
      const result = await ddb.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: '#uid = :uid',
          ExpressionAttributeNames: {
            '#uid': 'userId',
          },
          ExpressionAttributeValues: {
            ':uid': userId,
          },
        })
      )

      items = (result.Items || []) as any[]
      console.log('🔎 [emotions] Itens para userId', userId, ':', items.length)
    } else {
      // Opcional: se quiser permitir ver todas quando não logado
      const result = await ddb.send(
        new ScanCommand({
          TableName: TABLE_NAME,
        })
      )
      items = (result.Items || []) as any[]
      console.log('🔎 [emotions] Itens (sem userId):', items.length)
    }

    // Ordenar por order, depois por text
    const ordered = items.sort((a, b) => {
      const ao = a.order ?? 999999
      const bo = b.order ?? 999999
      if (ao !== bo) return ao - bo
      return (a.text ?? '').localeCompare(b.text ?? '', 'pt-BR', {
        sensitivity: 'base',
      })
    })

    const emotions = ordered.map((it) => {
      const label = it.text ? String(it.text) : 'Sem nome'
      const emoji = it.icon ? String(it.icon) : '😊'

      const value = label
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')

      return {
        emotionId: it.descriptorId as string,
        id: it.descriptorId as string,
        emoji,
        label,
        value,
        order: typeof it.order === 'number' ? it.order : undefined,
        type: 'custom' as const,
        isCustom: true,
        userId: it.userId,
      }
    })

    console.log('✅ [emotions] emotions retornadas:', emotions.length)
    console.log('✅ [emotions] primeira emoção:', emotions[0])

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

    const icon = body.emoji?.trim() || '😊'  // front manda "emoji", salva como "icon"
    const text = body.label?.trim()          // front manda "label", salva como "text"
    const order: number | null =
      typeof body.order === 'number' ? body.order : null

    if (!text) {
      return Response.json(
        { success: false, error: 'label obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se já existe emoção com esse text para o usuário
    const scan = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
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
    if (existing && existing.descriptorId) {
      // Já existe → Update
      const exprNames: Record<string, string> = { '#i': 'icon' }
      const exprValues: Record<string, any> = { ':i': icon }
      let updateExpr = 'SET #i = :i'

      if (order !== null) {
        exprNames['#o'] = 'order'
        exprValues[':o'] = order
        updateExpr += ', #o = :o'
      }

      console.log(
        '📝 [emotions] UpdateItem Key:',
        { userId, descriptorId: existing.descriptorId },
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
            descriptorId: existing.descriptorId,
          },
          UpdateExpression: updateExpr,
          ExpressionAttributeNames: exprNames,
          ExpressionAttributeValues: exprValues,
        })
      )

      const value = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')

      return Response.json(
        {
          success: true,
          emotion: {
            id: existing.descriptorId,
            emotionId: existing.descriptorId,
            emoji: icon,
            label: text,
            value,
            order: order ?? existing.order,
            type: 'custom' as const,
            isCustom: true,
          },
        },
        { status: 200 }
      )
    }

    // Não existe → criar novo
    const descriptorId = crypto.randomUUID()

    const item: any = {
      userId,
      descriptorId,
      icon,
      text,
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

    const value = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')

    console.log('✅ [emotions] Emoção criada com sucesso')
    return Response.json(
      {
        success: true,
        emotion: {
          id: descriptorId,
          emotionId: descriptorId,
          emoji: icon,
          label: text,
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

    const descriptorId = body.id as string | undefined
    const icon = body.emoji?.trim()   // front manda "emoji"
    const text = body.label?.trim()   // front manda "label"
    const order: number | null =
      typeof body.order === 'number' ? body.order : null

    if (!descriptorId) {
      return Response.json(
        { success: false, error: 'id obrigatório' },
        { status: 400 }
      )
    }

    const exprNames: Record<string, string> = {}
    const exprValues: Record<string, any> = {}
    let updateExpr = 'SET '
    let hasUpdate = false

    if (icon) {
      exprNames['#i'] = 'icon'
      exprValues[':i'] = icon
      updateExpr += '#i = :i'
      hasUpdate = true
    }

    if (text) {
      if (hasUpdate) updateExpr += ', '
      exprNames['#t'] = 'text'
      exprValues[':t'] = text
      updateExpr += '#t = :t'
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
      { userId, descriptorId },
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
          descriptorId,
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

    const descriptorId = body.id as string | undefined
    if (!descriptorId) {
      return Response.json(
        { success: false, error: 'id obrigatório' },
        { status: 400 }
      )
    }

    console.log('🗑️ [emotions] DeleteItem Key:', {
      userId,
      descriptorId,
    })

    await ddb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          userId,
          descriptorId,
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
