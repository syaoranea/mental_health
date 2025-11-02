
'use client'

import { Calendar, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getMoodBgColorClass, getMoodColorClass } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/header').then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => <div className="h-16 bg-white border-b border-gray-200"></div>
})

export function CalendarPageClient() {
  const router = useRouter()
  
  // Sample data for calendar
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
  
  // Sample mood data - in a real app this would come from the database
  const moodData: { [key: number]: number } = {
    1: 8, 3: 6, 5: 9, 7: 5, 10: 7, 12: 8, 15: 6, 18: 9, 20: 7, 22: 8, 25: 5, 28: 9
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-12 sm:h-16"></div>
      )
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const mood = moodData[day]
      const isToday = day === currentDate.getDate() && 
                     currentMonth === currentDate.getMonth() && 
                     currentYear === currentDate.getFullYear()
      
      days.push(
        <div
          key={day}
          className={`h-12 sm:h-16 border border-gray-200 p-1 sm:p-2 flex flex-col justify-between cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'ring-2 ring-primary' : ''
          } ${mood ? getMoodBgColorClass(mood) : ''}`}
        >
          <div className={`text-xs sm:text-sm font-medium ${
            isToday 
              ? 'text-primary font-bold' 
              : mood 
                ? getMoodColorClass(mood)
                : 'text-gray-700'
          }`}>
            {day}
          </div>
          {mood && (
            <div className="flex items-center justify-center">
              <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${getMoodBgColorClass(mood)} ${getMoodColorClass(mood)}`}>
                {mood}
              </div>
            </div>
          )}
        </div>
      )
    }
    
    return days
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Calendário de Humor
          </h1>
          <p className="text-gray-600">
            Visualize seus registros de humor ao longo do tempo
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => console.log('Previous month')}>
                    ← Mês Anterior
                  </Button>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {monthNames[currentMonth]} {currentYear}
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => console.log('Next month')}>
                    Próximo Mês →
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input 
                    placeholder="Buscar por data..." 
                    className="pl-10 w-40"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => console.log('Filters')}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Calendário</CardTitle>
                <CardDescription>
                  Clique em um dia para ver detalhes do registro
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-0 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-600 border-b">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-0">
                  {renderCalendarDays()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Legenda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100"></div>
                    <span className="text-sm">1-3: Baixo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-100"></div>
                    <span className="text-sm">4-6: Moderado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100"></div>
                    <span className="text-sm">7-10: Alto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-100"></div>
                    <span className="text-sm">Sem registro</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Este Mês</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Dias registrados:</span>
                  <span className="font-medium">12/31</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Humor médio:</span>
                  <span className="font-medium text-green-600">7.2/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Melhor dia:</span>
                  <span className="font-medium">28 (9/10)</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => router.push('/registrar')}
                  >
                    Registrar Hoje
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => router.push('/relatorios')}
                  >
                    Ver Relatórios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
