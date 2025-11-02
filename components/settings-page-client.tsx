
'use client'

import { Settings, Bell, Shield, User, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/header').then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => <div className="h-16 bg-white border-b border-gray-200"></div>
})

export function SettingsPageClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configurações
          </h1>
          <p className="text-gray-600">
            Personalize sua experiência no MeuRefúgio
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Perfil
              </CardTitle>
              <CardDescription>
                Informações básicas da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" defaultValue="Usuário Teste" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john@doe.com" className="mt-1" disabled />
                <p className="text-sm text-gray-500 mt-1">
                  O email não pode ser alterado após o cadastro
                </p>
              </div>
              <Button onClick={() => console.log('Saving changes...')}>Salvar Alterações</Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Lembretes
              </CardTitle>
              <CardDescription>
                Configure quando você deseja receber lembretes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="daily-reminder">Lembrete diário</Label>
                  <p className="text-sm text-gray-500">
                    Receba um lembrete para registrar seu humor
                  </p>
                </div>
                <Switch id="daily-reminder" defaultChecked />
              </div>
              
              <div>
                <Label htmlFor="reminder-time">Horário do lembrete</Label>
                <Input 
                  id="reminder-time" 
                  type="time" 
                  defaultValue="19:00" 
                  className="mt-1 w-auto"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-summary">Resumo semanal</Label>
                  <p className="text-sm text-gray-500">
                    Receba um resumo dos seus registros da semana
                  </p>
                </div>
                <Switch id="weekly-summary" />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacidade
              </CardTitle>
              <CardDescription>
                Configure como seus dados são tratados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="default-private">Registros privados por padrão</Label>
                  <p className="text-sm text-gray-500">
                    Novos registros serão marcados como privados automaticamente
                  </p>
                </div>
                <Switch id="default-private" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics">Permitir análise de padrões</Label>
                  <p className="text-sm text-gray-500">
                    Habilitar insights automáticos baseados nos seus dados
                  </p>
                </div>
                <Switch id="analytics" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Aparência
              </CardTitle>
              <CardDescription>
                Personalize a aparência da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tema</Label>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="sm" className="bg-white" onClick={() => console.log('Light theme')}>
                    ☀️ Claro
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => console.log('Dark theme')}>
                    🌙 Escuro
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => console.log('Auto theme')}>
                    🔄 Automático
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-700">Zona de Perigo</CardTitle>
              <CardDescription className="text-red-600">
                Ações irreversíveis relacionadas à sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-900">Exportar todos os dados</h3>
                  <p className="text-sm text-red-700">
                    Baixe uma cópia de todos os seus registros
                  </p>
                </div>
                <Button variant="outline" className="border-red-300 text-red-600">
                  Exportar
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-900">Excluir conta</h3>
                  <p className="text-sm text-red-700">
                    Remover permanentemente sua conta e todos os dados
                  </p>
                </div>
                <Button variant="destructive">
                  Excluir Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
