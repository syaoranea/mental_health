import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'

const REGION = process.env.AWS_REGION || 'us-east-1'
const TABLE_NAME = process.env.CONFIG_TABLE_NAME || 'configMeuRefugio'

const rawClient = new DynamoDBClient({ region: REGION })
const ddb = DynamoDBDocumentClient.from(rawClient)

// GET /api/config-meu-refugio?userId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    console.log('GET /api/config-meu-refugio userId =', userId)

    // 1) Busca config do usuário via Scan (filtrando por userId + isGlobal = false)
    const userRes = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: '#userId = :userId AND #isGlobal = :false',
        ExpressionAttributeNames: {
          '#userId': 'userId',
          '#isGlobal': 'isGlobal',
        },
        ExpressionAttributeValues: {
          ':userId': userId,
          ':false': false,
        },
        Limit: 1,
      })
    )

    let item: any = userRes.Items?.[0] ?? null

    console.log('Scan resultado (config de usuário):', item ? `encontrado (Id=${item.Id})` : 'não encontrado')

    // 2) Se não existir config do usuário, usa a global existente
    if (!item) {
      console.log('Nenhuma config de usuário, buscando config global existente...')
      const globalRes = await ddb.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            Id: '11111111111',
            userId: 'global',
          },
        })
      )

      item = globalRes.Item ?? null
    }

    // 3) Se nem global existir, devolve defaults
    if (!item) {
      console.log('Nenhuma config global encontrada, usando defaults')
      return NextResponse.json({
        name: null,
        email: null,
        dailyReminder: true,
        reminderTime: '19:00',
        weeklySummary: false,
        defaultPrivate: false,
        allowAnalytics: true,
        theme: 'claro',
      })
    }

    console.log('Config encontrada:', item)

    return NextResponse.json({
      name: item.name ?? null,
      email: item.email ?? null,
      dailyReminder: item.dailyReminder ?? true,
      reminderTime: item.reminderTime ?? '19:00',
      weeklySummary: item.weeklySummary ?? false,
      defaultPrivate: item.defaultPrivate ?? false,
      allowAnalytics: item.allowAnalytics ?? true,
      theme: item.theme ?? 'claro',
    })
  } catch (error) {
    console.error('Erro no GET /api/config-meu-refugio (DynamoDB):', error)
    return NextResponse.json(
      { error: 'Erro ao carregar configurações' },
      { status: 500 }
    )
  }
}

// PUT /api/config-meu-refugio
export async function PUT(req: Request) {
  try {
    const {
      userId,
      name,
      email,
      dailyReminder,
      reminderTime,
      weeklySummary,
      defaultPrivate,
      allowAnalytics,
      theme,
    } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    console.log('PUT /api/config-meu-refugio body =', {
      userId,
      name,
      email,
      dailyReminder,
      reminderTime,
      weeklySummary,
      defaultPrivate,
      allowAnalytics,
      theme,
    })

    // 1) Busca se já existe config do usuário (mesmo Scan do GET)
    const existingRes = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: '#userId = :userId AND #isGlobal = :false',
        ExpressionAttributeNames: {
          '#userId': 'userId',
          '#isGlobal': 'isGlobal',
        },
        ExpressionAttributeValues: {
          ':userId': userId,
          ':false': false,
        },
        Limit: 1,
      })
    )

    const existingItem = existingRes.Items?.[0]

    // 2) Se já existe, usa o Id existente; senão, gera um novo UUID
    const itemId = existingItem?.Id ?? randomUUID()

    console.log(
      'PUT: userId =',
      userId,
      '| Id =',
      itemId,
      '|',
      existingItem ? '(atualizando item existente)' : '(criando novo item)'
    )

    // 3) PutCommand (upsert)
    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          Id: itemId,          // UUID (reutilizado ou novo)
          userId: userId,      // SK = sub do Cognito
          isGlobal: false,
          name,
          email,
          dailyReminder,
          reminderTime,
          weeklySummary,
          defaultPrivate,
          allowAnalytics,
          theme,
        },
      })
    )

    console.log('PUT concluído com sucesso para Id =', itemId)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro no PUT /api/config-meu-refugio (DynamoDB):', error)
    return NextResponse.json(
      { error: 'Erro ao salvar configurações' },
      { status: 500 }
    )
  }
}