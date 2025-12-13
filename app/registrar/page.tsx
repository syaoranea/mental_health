import { redirect } from 'next/navigation'
import { ddb } from '@/lib/dynamodb'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { MoodRegistrationClient, MoodRegistrationData } from '@/components/mood-registration-client'

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
  { id: '1', name: 'Exercício físico', icon: '🏃', type: 'predefined', categorie: 'Saude' as const, isCustom: false },
  { id: '2', name: 'Meditação', icon: '🧘', type: 'predefined', categorie: 'Bem estar' as const, isCustom: false },
  { id: '3', name: 'Leitura', icon: '📚', type: 'predefined', categorie: 'Passatempo' as const, isCustom: false },
  { id: '4', name: 'Trabalho', icon: '💼', type: 'predefined', categorie: 'Trabalho' as const, isCustom: false },
  { id: '5', name: 'Socialização', icon: '👥', type: 'predefined', categorie: 'Versão Melhor de mim' as const, isCustom: false },
  { id: '6', name: 'Hobbies', icon: '🎨', type: 'predefined', categorie: 'Passatempo' as const, isCustom: false },

  { id: '7', name: 'Caminhada ao ar livre', icon: '🚶', type: 'predefined', categorie: 'Saude' as const, isCustom: false },
  { id: '8', name: 'Alongamento', icon: '🤸', type: 'predefined', categorie: 'Saude' as const, isCustom: false },
  { id: '9', name: 'Yoga', icon: '🧎', type: 'predefined', categorie: 'Bem estar' as const, isCustom: false },
  { id: '10', name: 'Respiração profunda', icon: '🌬️', type: 'predefined', categorie: 'Bem estar' as const, isCustom: false },

  { id: '11', name: 'Diário de gratidão', icon: '✍️', type: 'predefined', categorie: 'Versão Melhor de mim' as const, isCustom: false },
  { id: '12', name: 'Planejamento do dia', icon: '📝', type: 'predefined', categorie: 'Trabalho' as const, isCustom: false },
  { id: '13', name: 'Estudo', icon: '📖', type: 'predefined', categorie: 'Versão Melhor de mim' as const, isCustom: false },
  { id: '14', name: 'Ouvir música', icon: '🎧', type: 'predefined', categorie: 'Passatempo' as const, isCustom: false },

  { id: '15', name: 'Assistir série/filme', icon: '📺', type: 'predefined', categorie: 'Passatempo' as const, isCustom: false },
  { id: '16', name: 'Cozinhar algo saudável', icon: '🥗', type: 'predefined', categorie: 'Saude' as const, isCustom: false },
  { id: '17', name: 'Passear com pet', icon: '🐕', type: 'predefined', categorie: 'Bem estar' as const, isCustom: false },
  { id: '18', name: 'Tempo com família', icon: '👨‍👩‍👧‍👦', type: 'predefined', categorie: 'Versão Melhor de mim' as const, isCustom: false },

  { id: '19', name: 'Desenhar ou pintar', icon: '🖌️', type: 'predefined', categorie: 'Passatempo' as const, isCustom: false },
  { id: '20', name: 'Organizar o ambiente', icon: '🧹', type: 'predefined', categorie: 'Bem estar' as const, isCustom: false },
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
return <MoodRegistrationClient data={data as MoodRegistrationData} />}