// app/api/mood-stats/route.ts
import { NextRequest } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { ddb } from '@/lib/dynamodb'
import { parseCognitoIdToken } from '@/lib/cognito-token'

const TABLE_NAME = 'registroHumor'

function getUserId(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const idToken = auth.slice('Bearer '.length).trim()
  const user = parseCognitoIdToken(idToken)
  return (user as any)?.username ?? (user as any)?.sub ?? null
}

export async function GET(req: NextRequest) {
  try {
    console.log('🔎 [mood-stats] GET chamado')

    const userId = getUserId(req)
    console.log('👤 [mood-stats] userId:', userId)

    if (!userId) {
      return Response.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const year = Number(searchParams.get('year')) || new Date().getFullYear()
    const month = Number(searchParams.get('month')) || (new Date().getMonth() + 1)

    console.log('📅 [mood-stats] year/month:', year, month)

    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)).toISOString()
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString()

    console.log('⏱ [mood-stats] range:', start, '->', end)

    const result = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'userId = :uid AND #ts BETWEEN :start AND :end',
        ExpressionAttributeNames: {
          '#ts': 'timestamp',
        },
        ExpressionAttributeValues: {
          ':uid': userId,
          ':start': start,
          ':end': end,
        },
      })
    )

    const items = (result.Items || []) as any[]
    console.log('📦 [mood-stats] items encontrados:', items.length)

    const totalMoods = items.length

    let totalActivities = 0
    let somaHumor = 0
    let countHumor = 0

    for (const it of items) {
      // atividades: array de string
      if (Array.isArray(it.activities)) {
        totalActivities += it.activities.length
      }

      // humor médio: numericScale 1–10
      // tratar tanto número quanto array [n]
      let scale = it.numericScale
      
      // Se for array, pega o primeiro elemento
      if (Array.isArray(scale) && scale.length > 0) {
        scale = scale[0]
      }

      // Agora verifica se é número válido
      if (typeof scale === 'number' && !isNaN(scale)) {
        console.log(`✅ [mood-stats] Registro ${it.registroId}: numericScale = ${scale}`)
        somaHumor += scale
        countHumor++
      } else {
        console.log(`⚠️ [mood-stats] Registro ${it.registroId}: numericScale inválido =`, it.numericScale)
      }
    }

    const avgMood = countHumor > 0 ? somaHumor / countHumor : 0

    console.log('📊 [mood-stats] stats:', { 
      totalMoods, 
      totalActivities, 
      avgMood,
      somaHumor,
      countHumor 
    })

    return Response.json(
      {
        success: true,
        stats: {
          totalMoods,
          totalActivities,
          avgMood,
          year,
          month,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ [mood-stats] Erro GET:', error)
    return Response.json(
      { success: false, error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}