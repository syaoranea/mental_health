
'use client'

import { BarChart3, Calendar, TrendingUp, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/header').then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => <div className="h-16 bg-white border-b border-gray-200"></div>
})

export function ReportsPageClient() {
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Evolução Mensal
              </CardTitle>
              <CardDescription>
                Análise do seu humor nos últimos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-gray-500">
              <p>Gráfico de evolução do humor será exibido aqui</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Calendário de Humor
              </CardTitle>
              <CardDescription>
                Visão geral dos seus registros por data
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-gray-500">
              <p>Calendário de humor será exibido aqui</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: 'Média Geral', value: '7.2/10', color: 'text-green-600' },
            { title: 'Dias Registrados', value: '18 dias', color: 'text-blue-600' },
            { title: 'Atividades Favoritas', value: 'Autocuidado', color: 'text-purple-600' }
          ].map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Insights e Padrões</CardTitle>
            <CardDescription>
              Descobertas baseadas nos seus registros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">💪 Padrão Positivo</h3>
              <p className="text-blue-800 text-sm">
                Você tende a se sentir melhor nos dias em que pratica atividades físicas
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-900 mb-2">🎯 Meta Alcançada</h3>
              <p className="text-green-800 text-sm">
                Parabéns! Você registrou seu humor em 18 dos últimos 30 dias
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
