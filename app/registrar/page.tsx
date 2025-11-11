import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { ddb } from '@/lib/dynamodb'
import { ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { MoodRegistrationClient } from '@/components/mood-registration-client'

export const dynamic = 'force-dynamic'

// Função auxiliar (pode ficar aqui mesmo)
async function getRegistrationData(userId: string) {
  try {
    // Buscar categorias (as do usuário e as globais)
    const categoriesResult = await ddb.send(
      new ScanCommand({
        TableName: 'Categories',
        FilterExpression: 'attribute_not_exists(userId) OR userId = :uid',
        ExpressionAttributeValues: {
          ':uid': userId,
        },
      })
    )

    const categories = categoriesResult.Items || []

    // Buscar registro de hoje
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

    return {
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon || '',
        type: cat.type,
        isCustom: !!cat.isCustom,
      })),
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
    console.error('Registration data error:', error)
    return { categories: [], existingRecord: null }
  }
}

// ✅ O componente principal precisa ser exportado como default
export default async function RegistrarPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/entrar')
  }

  const data = await getRegistrationData('2')

  return <MoodRegistrationClient data={data} />
}




