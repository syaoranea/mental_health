
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard-client'

export const dynamic = 'force-dynamic'

/* async function getDashboardData(userId: string) {
  try {
    // Get recent mood records
    const recentMoods = await prisma.moodRecord.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 7,
      include: {
        activities: {
          include: {
            category: true
          }
        }
      }
    })

    // Get mood stats
    const totalMoods = await prisma.moodRecord.count({
      where: { userId }
    })

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const monthlyMoods = await prisma.moodRecord.findMany({
      where: {
        userId,
        date: { gte: thisMonth }
      },
      select: { numericScale: true }
    })

    const avgMood = monthlyMoods.length > 0 
      ? monthlyMoods.reduce((sum, mood) => sum + (mood.numericScale || 0), 0) / monthlyMoods.length
      : 0

    // Get activity stats
    const totalActivities = await prisma.activity.count({
      where: {
        moodRecord: {
          userId
        }
      }
    })

    // Get shared access info
    const sharedAccess = await prisma.sharedAccess.count({
      where: {
        ownerId: userId,
        status: 'ACCEPTED'
      }
    })

    return {
      recentMoods: recentMoods.map(mood => ({
        ...mood,
        date: mood.date.toISOString(),
        createdAt: mood.createdAt.toISOString(),
        updatedAt: mood.updatedAt.toISOString()
      })),
      stats: {
        totalMoods,
        avgMood: Math.round(avgMood * 10) / 10,
        totalActivities,
        sharedWith: sharedAccess
      }
    }
  } catch (error) {
    console.error('Dashboard data error:', error)
    return {
      recentMoods: [],
      stats: {
        totalMoods: 0,
        avgMood: 0,
        totalActivities: 0,
        sharedWith: 0
      }
    }
  }
} */

export default async function DashboardPage() {


  const data = {
    recentMoods: [],
    stats: {
      totalMoods: 1,
      avgMood: 2,
      totalActivities: 3,
      sharedWith: 1
    }
  };

 // const data = await getDashboardData(session.user.id)

 interface DashboardData {
  recentMoods: any[]
  stats: {
    totalMoods: number
    avgMood: number
    totalActivities: number
    sharedWith: number
  }
}

  return <DashboardClient data={data} />
}
