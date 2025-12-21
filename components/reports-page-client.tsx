'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchAuthSession } from 'aws-amplify/auth'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { BarChart3, Calendar, TrendingUp, Download, CheckCircle2, HelpCircle, Trophy, Medal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import dynamic from 'next/dynamic'
import { MoodChart } from '@/components/mood-chart'
import { EmotionGaugeChart } from '@/components/emotion-gauge-chart'

const Header = dynamic(() => import('@/components/header').then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => <div className="h-16 bg-white border-b border-gray-200"></div>
})

interface MoodRecord {
  id: string
  date: string
  numericScale: number
  emojis: string[]
  descriptiveWords: string[]
  activities: any[]
  notes: string
}

interface DaysStreakProps {
  moods: MoodRecord[]
}

function DaysStreak({ moods }: DaysStreakProps) {
  const today = new Date()

  const hasMoodOnDate = (date: Date) => {
    const target = date.toDateString()
    return moods.some(m => new Date(m.date).toDateString() === target)
  }

  // últimos 5 dias: hoje + 4 anteriores
  const days = Array.from({ length: 5 }).map((_, index) => {
    const d = new Date(today)
    d.setDate(today.getDate() - index)
    return d
  })

  // inverter para mostrar do mais antigo ao mais recente: Ter Qua Qui Sex Hoje
  const orderedDays = [...days].reverse()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dias Seguidos</CardTitle>
        <CardDescription>
          Veja seus check-ins nos últimos dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative flex items-end justify-between gap-2">
          {/* Linha verde conectando os ícones */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-emerald-500" style={{ zIndex: 0 }} />

          {orderedDays.map((day, idx) => {
            const isToday = day.toDateString() === today.toDateString()
            const hasMood = hasMoodOnDate(day)
            const weekDayShort = format(day, 'EEE', { locale: ptBR }) // Seg, Ter, Qua...

            return (
              <div
                key={idx}
                className="flex flex-col items-center flex-1 relative"
                style={{ zIndex: 1 }}
              >
                {/* Ícone */}
                <div className="h-10 flex items-center justify-center mb-2 bg-white rounded-full">
                  {hasMood ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <HelpCircle className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                {/* Dia da semana */}
                <div className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-gray-600'}`}>
                  {isToday ? 'Hoje' : weekDayShort.replace('.', '')}
                </div>

                {/* Data (número) */}
                <div className={`mt-1 text-sm font-semibold ${isToday ? 'text-primary' : 'text-gray-800'}`}>
                  {format(day, 'd', { locale: ptBR })}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  levels: {
    bronze: { target: number; label: string }
    silver: { target: number; label: string }
    gold: { target: number; label: string }
  }
  current: number
  category: 'streak' | 'records' | 'mood' | 'activities'
}

interface AchievementsProps {
  moods: MoodRecord[]
  daysWithRecords: number
}

function Achievements({ moods, daysWithRecords }: AchievementsProps) {
  // Calcular sequência de dias seguidos
  const calculateStreak = () => {
    if (moods.length === 0) return 0
    
    const sortedDates = moods
      .map(m => new Date(m.date))
      .sort((a, b) => b.getTime() - a.getTime())
    
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    
    for (const date of sortedDates) {
      const moodDate = new Date(date)
      moodDate.setHours(0, 0, 0, 0)
      
      const diffDays = Math.floor((currentDate.getTime() - moodDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === streak) {
        streak++
      } else if (diffDays > streak) {
        break
      }
    }
    
    return streak
  }

  const currentStreak = calculateStreak()
  const totalRecords = moods.length
  const avgMood = moods.length > 0
    ? moods.reduce((acc, m) => acc + m.numericScale, 0) / moods.length
    : 0
  const totalActivities = moods.reduce((acc, m) => acc + (m.activities?.length || 0), 0)

  const achievements: Achievement[] = [
    {
      id: 'streak',
      title: 'Dias Seguidos',
      description: 'Registre seu humor consecutivamente',
      icon: '🔥',
      levels: {
        bronze: { target: 3, label: '3 dias' },
        silver: { target: 7, label: '7 dias' },
        gold: { target: 30, label: '30 dias' },
      },
      current: currentStreak,
      category: 'streak',
    },
    {
      id: 'records',
      title: 'Registros Totais',
      description: 'Acumule registros de humor',
      icon: '📝',
      levels: {
        bronze: { target: 10, label: '10 registros' },
        silver: { target: 50, label: '50 registros' },
        gold: { target: 100, label: '100 registros' },
      },
      current: totalRecords,
      category: 'records',
    },
    {
      id: 'positive',
      title: 'Humor Positivo',
      description: 'Mantenha uma média alta de humor',
      icon: '😊',
      levels: {
        bronze: { target: 6, label: 'Média 6.0' },
        silver: { target: 7.5, label: 'Média 7.5' },
        gold: { target: 9, label: 'Média 9.0' },
      },
      current: avgMood,
      category: 'mood',
    },
    {
      id: 'activities',
      title: 'Explorador de Atividades',
      description: 'Registre diferentes atividades',
      icon: '🎯',
      levels: {
        bronze: { target: 10, label: '10 atividades' },
        silver: { target: 30, label: '30 atividades' },
        gold: { target: 100, label: '100 atividades' },
      },
      current: totalActivities,
      category: 'activities',
    },
    {
      id: 'consistency',
      title: 'Consistência',
      description: 'Registre em dias diferentes',
      icon: '📅',
      levels: {
        bronze: { target: 7, label: '7 dias únicos' },
        silver: { target: 20, label: '20 dias únicos' },
        gold: { target: 60, label: '60 dias únicos' },
      },
      current: daysWithRecords,
      category: 'records',
    },
    {
      id: 'wellbeing',
      title: 'Bem-Estar Equilibrado',
      description: 'Mantenha humor estável acima de 7',
      icon: '⚖️',
      levels: {
        bronze: { target: 5, label: '5 registros ≥7' },
        silver: { target: 15, label: '15 registros ≥7' },
        gold: { target: 40, label: '40 registros ≥7' },
      },
      current: moods.filter(m => m.numericScale >= 7).length,
      category: 'mood',
    },
  ]

  const getAchievementLevel = (achievement: Achievement): 'gold' | 'silver' | 'bronze' | 'locked' => {
    if (achievement.current >= achievement.levels.gold.target) return 'gold'
    if (achievement.current >= achievement.levels.silver.target) return 'silver'
    if (achievement.current >= achievement.levels.bronze.target) return 'bronze'
    return 'locked'
  }

  const getProgressPercentage = (achievement: Achievement): number => {
    const level = getAchievementLevel(achievement)
    if (level === 'gold') return 100
    
    let nextTarget = achievement.levels.bronze.target
    if (level === 'bronze') nextTarget = achievement.levels.silver.target
    if (level === 'silver') nextTarget = achievement.levels.gold.target
    
    return Math.min((achievement.current / nextTarget) * 100, 100)
  }

  const getLevelColor = (level: 'gold' | 'silver' | 'bronze' | 'locked') => {
    switch (level) {
      case 'gold': return 'bg-yellow-500'
      case 'silver': return 'bg-gray-400'
      case 'bronze': return 'bg-orange-600'
      default: return 'bg-gray-300'
    }
  }

  const getLevelBorderColor = (level: 'gold' | 'silver' | 'bronze' | 'locked') => {
    switch (level) {
      case 'gold': return 'border-yellow-500'
      case 'silver': return 'border-gray-400'
      case 'bronze': return 'border-orange-600'
      default: return 'border-gray-300'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Conquistas
        </CardTitle>
        <CardDescription>
          Desbloqueie conquistas usando o app e alcance novos níveis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const level = getAchievementLevel(achievement)
            const progress = getProgressPercentage(achievement)
            const isUnlocked = level !== 'locked'

            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isUnlocked
                    ? `${getLevelBorderColor(level)} bg-white`
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Ícone e Nível */}
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  {isUnlocked && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getLevelColor(level)} text-white text-xs font-bold`}>
                      <Medal className="w-3 h-3" />
                      {level.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Título e Descrição */}
                <h3 className={`font-semibold mb-1 ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                  {achievement.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  {achievement.description}
                </p>

                {/* Progresso */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">
                      {achievement.current.toFixed(achievement.category === 'mood' ? 1 : 0)} / {
                        level === 'gold'
                          ? achievement.levels.gold.target
                          : level === 'silver'
                          ? achievement.levels.gold.target
                          : level === 'bronze'
                          ? achievement.levels.silver.target
                          : achievement.levels.bronze.target
                      }
                    </span>
                    <span className="font-medium text-gray-700">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isUnlocked ? getLevelColor(level) : 'bg-gray-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Níveis */}
                  <div className="flex justify-between text-xs pt-1">
                    <span className={achievement.current >= achievement.levels.bronze.target ? 'text-orange-600 font-semibold' : 'text-gray-400'}>
                      🥉 {achievement.levels.bronze.label}
                    </span>
                    <span className={achievement.current >= achievement.levels.silver.target ? 'text-gray-500 font-semibold' : 'text-gray-400'}>
                      🥈 {achievement.levels.silver.label}
                    </span>
                    <span className={achievement.current >= achievement.levels.gold.target ? 'text-yellow-600 font-semibold' : 'text-gray-400'}>
                      🥇 {achievement.levels.gold.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export function ReportsPageClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [moods, setMoods] = useState<MoodRecord[]>([])
  const [avgMood, setAvgMood] = useState(0)
  const [daysWithRecords, setDaysWithRecords] = useState(0)

  useEffect(() => {
    async function init() {
      try {
        const session = await fetchAuthSession()
        const idToken = session.tokens?.idToken?.toString()
        if (!idToken) {
          router.replace('/auth/entrar')
          return
        }

        // Buscar últimos 30 registros do usuário
        const res = await fetch('/api/mood-records?limit=30', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })

        const data = await res.json()
        console.log('Resposta /api/mood-records (reports):', data)

        if (res.ok && data.success) {
          const formatted: MoodRecord[] = data.records.map((record: any) => ({
            id: record.registroId,
            date: record.timestamp,
            numericScale: Array.isArray(record.numericScale)
              ? record.numericScale[0]
              : record.numericScale,
            emojis: (record.sentimentos || []).map((s: any) => s.emoji).filter(Boolean),
            descriptiveWords: record.descriptiveWords || [],
            activities: record.activities || [],
            notes: record.notes || '',
          }))

          setMoods(formatted)

          // Calcular média geral
          const validScales = formatted
            .map(m => m.numericScale)
            .filter((n): n is number => typeof n === 'number' && !isNaN(n))

          if (validScales.length > 0) {
            const soma = validScales.reduce((acc, n) => acc + n, 0)
            setAvgMood(soma / validScales.length)
          } else {
            setAvgMood(0)
          }

          // Dias distintos com registros
          const daysSet = new Set(
            formatted.map(m => new Date(m.date).toDateString())
          )
          setDaysWithRecords(daysSet.size)
        }
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>Carregando relatórios...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Relatórios e Análises
          </h1>
          <p className="text-gray-600">
            Visualize sua jornada de bem-estar mental através de gráficos e insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Evolução Mensal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Evolução Mensal
              </CardTitle>
              <CardDescription>
                Análise do seu humor nos últimos 30 registros
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {moods.length > 0 ? (
                <MoodChart data={moods} period="30d" />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  Você ainda não possui registros suficientes para exibir o gráfico.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contagem de Emoções */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Contagem de Emoções
              </CardTitle>
              <CardDescription>
                Visão geral das emoções registradas
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <EmotionGaugeChart moods={moods} />
            </CardContent>
          </Card>
        </div>

        {/* Cards de estatísticas usando dados reais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {avgMood.toFixed(1)}/10
                </div>
                <div className="text-sm text-gray-600">Média Geral</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {daysWithRecords} dias
                </div>
                <div className="text-sm text-gray-600">Dias Registrados (últimos 30 registros)</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {/* placeholder por enquanto */}
                  Em breve
                </div>
                <div className="text-sm text-gray-600">Atividades Favoritas</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SEÇÃO: Dias Seguidos */}
        <div className="mb-8">
          <DaysStreak moods={moods} />
        </div>

        {/* SEÇÃO: Conquistas */}
        <div className="mb-8">
          <Achievements moods={moods} daysWithRecords={daysWithRecords} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Insights e Padrões</CardTitle>
            <CardDescription>
              Descobertas baseadas nos seus registros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mantive os insights estáticos por enquanto */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">💪 Padrão Positivo</h3>
              <p className="text-blue-800 text-sm">
                Você tende a se sentir melhor nos dias em que pratica atividades físicas
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-900 mb-2">🎯 Meta Alcançada</h3>
              <p className="text-green-800 text-sm">
                Parabéns! Você registrou seu humor em {daysWithRecords} dias recentes
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-medium text-purple-900 mb-2">🌱 Sugestão</h3>
              <p className="text-purple-800 text-sm">
                Considere adicionar mais atividades de socialização para equilibrar seu bem-estar
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar Relatório PDF
          </Button>
        </div>
      </main>
    </div>
  )
}