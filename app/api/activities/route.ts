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

const TABLE_NAME = 'categoriesAtividades'

// ────────────────────────────────────── utils
function getUserId(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const idToken = auth.slice('Bearer '.length).trim()
  const user = parseCognitoIdToken(idToken)
  return (user as any)?.username ?? (user as any)?.sub ?? null
}

// ────────────────────────────────────── GET  → lista atividades (pré-definidas + do usuário)
export async function GET(req: NextRequest) {
  try {
    console.log('🔎 [activities] GET chamado')

    const userId = getUserId(req)

    const result = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    )

    const items = (result.Items || []) as any[]
    console.log('🔎 [activities] Total itens na tabela:', items.length)

    // Se você tiver atividades globais, pode marcar com userId = 'global' ou similar
    const globais = items.filter((it) => !it.userId || it.userId === 'global')
    const personalizados =
      userId != null ? items.filter((it) => it.userId === userId) : []

    // Aqui não estou usando order, mas se quiser pode adicionar depois
    const ordered = [...globais, ...personalizados].sort((a, b) =>
      (a.name ?? '').localeCompare(b.name ?? '', 'pt-BR', {
        sensitivity: 'base',
      })
    )

    const activities = ordered.map((it) => ({
      activityId: it.activityId as string,
      id: (it.activityId as string) ?? (it.id as string), // compat front
      name: it.name as string,
      icon: (it.icon as string) ?? '📝',
      type: (it.type as 'predefined' | 'custom') ?? 'custom',
      isCustom: it.isCustom ?? (it.userId && it.userId !== 'global'),
    }))

    console.log('🔎 [activities] activities retornadas:', activities)

    return Response.json({ success: true, activities }, { status: 200 })
  } catch (error) {
    console.error('❌ [activities] Erro GET:', error)
    return Response.json(
      { success: false, error: 'Erro ao buscar atividades' },
      { status: 500 }
    )
  }
}

// ────────────────────────────────────── POST → adicionar atividade customizada
export async function POST(req: NextRequest) {
  try {
    console.log('🔎 [activities] POST chamado')

    const userId = getUserId(req)
    if (!userId) {
      console.log('⚠️ [activities] POST sem userId (não autenticado)')
      return Response.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('🔎 [activities] POST body:', body)

    const name = body.name?.trim()
    const icon = body.icon?.trim() || '📝'

    if (!name) {
      return Response.json(
        { success: false, error: 'name obrigatório' },
        { status: 400 }
      )
    }

    // (Opcional) evitar duplicar pelo mesmo nome para o usuário
    const scan = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: '#uid = :uid AND #nm = :nm',
        ExpressionAttributeNames: {
          '#uid': 'userId',
          '#nm': 'name',
        },
        ExpressionAttributeValues: {
          ':uid': userId,
          ':nm': name,
        },
      })
    )

    const existing = (scan.Items || [])[0] as any | undefined
    if (existing && existing.activityId) {
      console.log('ℹ️ [activities] Já existe atividade com esse nome, retornando existente')
      return Response.json(
        {
          success: true,
          activity: {
            id: existing.activityId,
            name: existing.name,
            icon: existing.icon ?? '📝',
            type: existing.type ?? 'custom',
            isCustom: existing.isCustom ?? true,
          },
        },
        { status: 200 }
      )
    }

    const activityId = crypto.randomUUID()

    const item: any = {
      userId,
      activityId,
      name,
      icon,
      type: 'custom',
      isCustom: true,
    }

    console.log('📝 [activities] PutItem Item (novo):', item)

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    )

    console.log('✅ [activities] Atividade criada com sucesso')
    return Response.json(
      {
        success: true,
        activity: {
          id: activityId,
          name,
          icon,
          type: 'custom' as const,
          isCustom: true,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ [activities] Erro POST:', error)
    return Response.json(
      { success: false, error: 'Erro ao adicionar atividade' },
      { status: 500 }
    )
  }
}

// ────────────────────────────────────── PUT → editar atividade (nome / ícone)
export async function PUT(req: NextRequest) {
  try {
    console.log('🔎 [activities] PUT chamado')

    const userId = getUserId(req)
    if (!userId) {
      console.log('⚠️ [activities] PUT sem userId (não autenticado)')
      return Response.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('🔎 [activities] PUT body:', body)

    const activityId = body.id as string | undefined
    const name = body.name?.trim()
    const icon = body.icon?.trim()

    if (!activityId) {
      return Response.json(
        { success: false, error: 'id obrigatório' },
        { status: 400 }
      )
    }

    const exprNames: Record<string, string> = {}
    const exprValues: Record<string, any> = {}
    let updateExpr = 'SET '

    if (name) {
      exprNames['#n'] = 'name'
      exprValues[':n'] = name
      updateExpr += '#n = :n'
    }

    if (icon) {
      if (name) updateExpr += ', '
      exprNames['#i'] = 'icon'
      exprValues[':i'] = icon
      updateExpr += '#i = :i'
    }

    if (!name && !icon) {
      return Response.json(
        { success: false, error: 'Nada para atualizar' },
        { status: 400 }
      )
    }

    console.log(
      '📝 [activities] UpdateItem Key:',
      { userId, activityId },
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
          activityId,
        },
        UpdateExpression: updateExpr,
        ExpressionAttributeNames: exprNames,
        ExpressionAttributeValues: exprValues,
      })
    )

    console.log('✅ [activities] Atividade atualizada com sucesso')
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('❌ [activities] Erro PUT:', error)
    return Response.json(
      { success: false, error: 'Erro ao atualizar atividade' },
      { status: 500 }
    )
  }
}

// ────────────────────────────────────── DELETE → excluir atividade
export async function DELETE(req: NextRequest) {
  try {
    console.log('🔎 [activities] DELETE chamado')

    const userId = getUserId(req)
    if (!userId) {
      console.log('⚠️ [activities] DELETE sem userId (não autenticado)')
      return Response.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('🔎 [activities] DELETE body:', body)

    const activityId = body.id as string | undefined
    if (!activityId) {
      return Response.json(
        { success: false, error: 'id obrigatório' },
        { status: 400 }
      )
    }

    console.log('🗑️ [activities] DeleteItem Key:', {
      userId,
      activityId,
    })

    await ddb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          userId,
          activityId,
        },
      })
    )

    console.log('✅ [activities] Atividade deletada com sucesso')
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('❌ [activities] Erro DELETE:', error)
    return Response.json(
      { success: false, error: 'Erro ao excluir atividade' },
      { status: 500 }
    )
  }
}