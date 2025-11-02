
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'
import { MoodRegistrationClient } from '@/components/mood-registration-client'

export const dynamic = 'force-dynamic'

async function getRegistrationData(userId: string) {
  try {
    // Get categories for activities
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId: null }, // predefined categories
          { userId } // user's custom categories
        ]
      },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    })

    // Check if user already registered today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayRecord = await prisma.moodRecord.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        activities: {
          include: {
            category: true
          }
        }
      }
    })

    return {
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon || '',
        type: cat.type as 'predefined' | 'custom',
        isCustom: cat.isCustom
      })),
      existingRecord: todayRecord ? {
        ...todayRecord,
        date: todayRecord.date.toISOString(),
        createdAt: todayRecord.createdAt.toISOString(),
        updatedAt: todayRecord.updatedAt.toISOString()
      } : null
    }
  } catch (error) {
    console.error('Registration data error:', error)
    return {
      categories: [],
      existingRecord: null
    }
  }
}

export default async function MoodRegistrationPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/entrar')
  }

  const data = await getRegistrationData(session.user.id)

  return <MoodRegistrationClient data={data} />
}
