import { redirect } from 'next/navigation'
import { ddb } from '@/lib/dynamodb'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { MoodRegistrationClient } from '@/components/mood-registration-client'

export const dynamic = 'force-dynamic'

async function getRegistrationData(userId: string) {
  try {
    // 1) Buscar registro de hoje (MoodRecords)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const recordsResult = await ddb.send(
      new QueryCommand({
        TableName: 'MoodRecords',
        KeyConditionExpression:
          'userId = :uid AND #date BETWEEN :today AND :tomorrow',
        ExpressionAttributeNames: {
          '#date': 'date',
        },
        ExpressionAttributeValues: {
          ':uid': userId,
          ':today': today.toISOString(),
          ':tomorrow': tomorrow.toISOString(),
        },
      })
    )

    const todayRecord = recordsResult.Items?.[0]

    // 2) Atividades (por enquanto hardcoded, depois você pode buscar de outra tabela)
    const categories = [
      { id: '1', name: 'Exercício físico', icon: '🏃', type: 'predefined' as const, isCustom: false },
      { id: '2', name: 'Meditação', icon: '🧘', type: 'predefined' as const, isCustom: false },
      { id: '3', name: 'Leitura', icon: '📚', type: 'predefined' as const, isCustom: false },
      { id: '4', name: 'Trabalho', icon: '💼', type: 'predefined' as const, isCustom: false },
      { id: '5', name: 'Socialização', icon: '👥', type: 'predefined' as const, isCustom: false },
      { id: '6', name: 'Hobbies', icon: '🎨', type: 'predefined' as const, isCustom: false },
    ]

    return {
      categories,
      existingRecord: todayRecord
        ? {
            ...todayRecord,
            date: todayRecord.date,
            createdAt: todayRecord.createdAt,
            updatedAt: todayRecord.updatedAt,
          }
        : null,
    }
  } catch (error) {
    console.error('❌ Registration data error:', error)
    return { categories: [], existingRecord: null }
  }
}

export default async function RegistrarPage() {
  const data = await getRegistrationData('google_116737357434516142663')
  return <MoodRegistrationClient data={data} />
}