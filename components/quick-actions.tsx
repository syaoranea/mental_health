
'use client'

import { Plus, BarChart3, Users, Calendar, Heart, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface QuickActionsProps {
  hasRecordedToday: boolean
}

export function QuickActions({ hasRecordedToday }: QuickActionsProps) {
  const actions = [
    {
      icon: Plus,
      title: hasRecordedToday ? 'Editar Registro' : 'Registrar Humor',
      description: hasRecordedToday ? 'Atualizar hoje' : 'Como você está?',
      href: '/registrar',
      primary: !hasRecordedToday,
      color: 'text-primary'
    },
    {
      icon: BarChart3,
      title: 'Ver Relatórios',
      description: 'Análises e insights',
      href: '/relatorios',
      primary: false,
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Compartilhar',
      description: 'Gerenciar acesso',
      href: '/compartilhar',
      primary: false,
      color: 'text-green-600'
    },
    {
      icon: Settings,
      title: 'Configurações',
      description: 'Lembretes e privacidade',
      href: '/configuracoes',
      primary: false,
      color: 'text-gray-600'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Ações Rápidas
        </CardTitle>
        <CardDescription>
          Acesse rapidamente as principais funções
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Button
              variant={action.primary ? "default" : "outline"}
              className="w-full justify-start gap-3 h-auto py-3"
              size="sm"
            >
              <action.icon className={`w-4 h-4 ${action.primary ? '' : action.color}`} />
              <div className="text-left">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs opacity-70">{action.description}</div>
              </div>
            </Button>
          </Link>
        ))}
        
        <div className="pt-2 border-t">
          <Link href="/calendário">
            <Button variant="ghost" className="w-full justify-start gap-3" size="sm">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm">Ver Calendário</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
