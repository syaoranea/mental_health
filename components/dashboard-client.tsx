
'use client'

import { useEffect, useState } from 'react'
import { Heart, Plus, TrendingUp, Activity, Users, Calendar, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/header').then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => <div className="h-16 bg-white border-b border-gray-200"></div>
})
import { MoodChart } from '@/components/mood-chart'
import { RecentMoods } from '@/components/recent-moods'
import { QuickActions } from '@/components/quick-actions'
import { formatDate, getMoodColorClass } from '@/lib/utils'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchAuthSession, signInWithRedirect } from 'aws-amplify/auth'


interface DashboardData {
  recentMoods: any[]
  stats: {
    totalMoods: number
    avgMood: number
    totalActivities: number
    sharedWith: number
  }
}

interface DashboardClientProps {
  data: DashboardData
}

export default function DashboardClient({ data }: DashboardClientProps) {
  const { recentMoods, stats } = data
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d')
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const searchParams = useSearchParams();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [errorInfo, setErrorInfo] = useState<any>(null);
  
  useEffect(() => {
    async function init() {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
       if (!idToken) {
          router.replace('/auth/entrar');
          return;
        }

        const res = await fetch('/api/user', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        const data = await res.json();
        console.log('Resposta /api/user:', data);
      } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
        /* router.replace('/auth/entrar'); */
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [searchParams]);

    const loginGoogle = async () => {
      await signInWithRedirect({ provider: 'Google' });
    };

  const todayMood = recentMoods.find(mood => {
    const moodDate = new Date(mood.date).toDateString()
    const today = new Date().toDateString()
    return moodDate === today
  })

  const hasRecordedToday = !!todayMood

   if (loading) return <div>Carregando...</div>;
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bem-vindo de volta! 👋
              </h1>
              <p className="text-gray-600">
                {hasRecordedToday 
                  ? `Você já registrou seu humor hoje (${todayMood.numericScale}/10)`
                  : 'Como você está se sentindo hoje?'
                }
              </p>
            </div>
            
            {!hasRecordedToday && (
              <Link href="/registrar">
                <Button size="lg" className="shadow-lg">
                  <Plus className="mr-2 w-5 h-5" />
                  Registrar Humor
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Registros Totais
              </CardTitle>
              <Calendar className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalMoods}</div>
              <p className="text-xs text-gray-500 mt-1">
                dias acompanhados
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Humor Médio
              </CardTitle>
              <Heart className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getMoodColorClass(stats.avgMood)}`}>
                {stats.avgMood.toFixed(1)}/10
              </div>
              <Progress 
                value={(stats.avgMood / 10) * 100} 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Atividades
              </CardTitle>
              <Activity className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalActivities}</div>
              <p className="text-xs text-gray-500 mt-1">
                registradas
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Compartilhado
              </CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.sharedWith}</div>
              <p className="text-xs text-gray-500 mt-1">
                pessoa{stats.sharedWith !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mood Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Evolução do Humor
                    </CardTitle>
                    <CardDescription>
                      Acompanhe sua jornada emocional
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {(['7d', '30d', '90d'] as const).map((period) => (
                      <Button
                        key={period}
                        size="sm"
                        variant={selectedPeriod === period ? "default" : "outline"}
                        onClick={() => setSelectedPeriod(period)}
                      >
                        {period === '7d' ? '7 dias' : period === '30d' ? '30 dias' : '90 dias'}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MoodChart 
                  data={recentMoods} 
                  period={selectedPeriod} 
                />
              </CardContent>
            </Card>

            {/* Recent Moods */}
            <Card>
              <CardHeader>
                <CardTitle>Registros Recentes</CardTitle>
                <CardDescription>
                  Seus últimos registros de humor e atividades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentMoods moods={recentMoods} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions hasRecordedToday={hasRecordedToday} />

            {/* Today's Summary */}
            {todayMood && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hoje</CardTitle>
                  <CardDescription>
                    {formatDate(new Date())}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Humor</p>
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${getMoodColorClass(todayMood.numericScale)}`}>
                        {todayMood.numericScale}/10
                      </span>
                      <div className="flex gap-1">
                        {todayMood.emojis?.map((emoji: string, index: number) => (
                          <span key={index} className="text-lg">{emoji}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {todayMood.descriptiveWords?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Sentimentos</p>
                      <div className="flex flex-wrap gap-1">
                        {todayMood.descriptiveWords.map((word: string, index: number) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {todayMood.activities?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Atividades</p>
                      <div className="space-y-2">
                        {todayMood.activities.map((activity: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span>{activity.category?.icon}</span>
                            <span>{activity.category?.name}</span>
                            {activity.completed && (
                              <span className="text-green-600 text-xs">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Emergency Resources */}
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Precisa de Ajuda?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700 mb-4">
                  Recursos de apoio disponíveis 24h
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-600 font-medium">CVV:</span>
                    <a href="tel:188" className="text-red-700 hover:underline">188</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600 font-medium">CAPS:</span>
                    <a href="tel:136" className="text-red-700 hover:underline">136</a>
                  </div>
                </div>
                <Link href="/emergencia">
                  <Button size="sm" variant="outline" className="w-full mt-4 border-red-300 text-red-600 hover:bg-red-100">
                    Ver mais recursos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
