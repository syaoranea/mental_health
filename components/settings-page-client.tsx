'use client'

import { useState, useEffect } from 'react'
import { Settings, Bell, Shield, User, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import dynamic from 'next/dynamic'
import { fetchUserAttributes } from 'aws-amplify/auth'
import { toast } from 'sonner'

const Header = dynamic(
  () => import('@/components/header').then(mod => ({ default: mod.Header })),
  {
    ssr: false,
    loading: () => <div className="h-16 bg-white border-b border-gray-200"></div>,
  }
)

type ThemeOption = 'claro' | 'escuro' | 'sistema'

type ConfigResponse = {
  name: string | null
  email: string | null
  dailyReminder: boolean
  reminderTime: string
  weeklySummary: boolean
  defaultPrivate: boolean
  allowAnalytics: boolean
  theme: ThemeOption
}

export function SettingsPageClient() {
  const [userId, setUserId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [dailyReminder, setDailyReminder] = useState(true)
  const [reminderTime, setReminderTime] = useState('19:00')
  const [weeklySummary, setWeeklySummary] = useState(false)
  const [defaultPrivate, setDefaultPrivate] = useState(false)
  const [allowAnalytics, setAllowAnalytics] = useState(true)
  const [theme, setTheme] = useState<ThemeOption>('sistema')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadConfig() {
      try {
        console.log('[Settings] Buscando atributos do Cognito...')
        // 1) Buscar atributos do Cognito
        const attributes = await fetchUserAttributes()

        const sub = attributes.sub
        if (!sub) {
          throw new Error('Usuário sem "sub" no Cognito')
        }
        setUserId(sub)
        console.log('[Settings] userId (sub) =', sub)

        const cognitoName =
          attributes.name ||
          attributes.given_name ||
          attributes.preferred_username ||
          'Usuário'

        const cognitoEmail = attributes.email || ''
        console.log('[Settings] Cognito name/email =', cognitoName, cognitoEmail)

        // 2) Buscar config no backend (DynamoDB) via GET
        const url = `/api/config-meu-refugio?userId=${encodeURIComponent(sub)}`
        console.log('[Settings] Chamando API de config (GET):', url)

        const res = await fetch(url, {
          method: 'GET',
        })

        console.log('[Settings] Resposta GET status =', res.status)

        if (!res.ok) {
          throw new Error('Falha ao buscar configurações')
        }

        const config = (await res.json()) as ConfigResponse
        console.log('[Settings] Config recebida =', config)

        // 3) Combinar Cognito + tabela
        setName(config.name ?? cognitoName)
        setEmail(config.email ?? cognitoEmail)

        setDailyReminder(config.dailyReminder)
        setReminderTime(config.reminderTime)
        setWeeklySummary(config.weeklySummary)
        setDefaultPrivate(config.defaultPrivate)
        setAllowAnalytics(config.allowAnalytics)
        setTheme(config.theme)
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
        toast.error('Erro ao carregar configurações')
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  const handleSaveProfile = async () => {
    if (!userId) return

    try {
      setSaving(true)
      console.log('[Settings] Salvando configurações (PUT) para userId =', userId)

      // 1) Salva configurações na tabela configMeuRefugio (DynamoDB)
      const res = await fetch('/api/config-meu-refugio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name,
          email,
          dailyReminder,
          reminderTime,
          weeklySummary,
          defaultPrivate,
          allowAnalytics,
          theme,
        }),
      })

      console.log('[Settings] Resposta PUT status =', res.status)

      if (!res.ok) {
        throw new Error('Falha ao salvar configurações')
      }

      toast.success('Alterações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar alterações')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">Personalize sua experiência no MeuRefúgio</p>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Perfil
              </CardTitle>
              <CardDescription>Informações básicas da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={loading}
                  placeholder={loading ? 'Carregando...' : 'Seu nome'}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  placeholder={loading ? 'Carregando...' : 'seu@email.com'}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  O email não pode ser alterado após o cadastro
                </p>
              </div>
              <Button onClick={handleSaveProfile} disabled={loading || saving}>
                {loading ? 'Carregando...' : saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Lembretes
              </CardTitle>
              <CardDescription>Configure quando você deseja receber lembretes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="daily-reminder">Lembrete diário</Label>
                  <p className="text-sm text-gray-500">
                    Receba um lembrete para registrar seu humor
                  </p>
                </div>
                <Switch
                  id="daily-reminder"
                  checked={dailyReminder}
                  onCheckedChange={setDailyReminder}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="reminder-time">Horário do lembrete</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  disabled={loading}
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
                <Switch
                  id="weekly-summary"
                  checked={weeklySummary}
                  onCheckedChange={setWeeklySummary}
                  disabled={loading}
                />
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
              <CardDescription>Configure como seus dados são tratados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="default-private">Registros privados por padrão</Label>
                  <p className="text-sm text-gray-500">
                    Novos registros serão marcados como privados automaticamente
                  </p>
                </div>
                <Switch
                  id="default-private"
                  checked={defaultPrivate}
                  onCheckedChange={setDefaultPrivate}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics">Permitir análise de padrões</Label>
                  <p className="text-sm text-gray-500">
                    Habilitar insights automáticos baseados nos seus dados
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={allowAnalytics}
                  onCheckedChange={setAllowAnalytics}
                  disabled={loading}
                />
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
              <CardDescription>Personalize a aparência da aplicação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tema</Label>
                <div className="mt-2 flex gap-2">
                  <Button
                    variant={theme === 'claro' ? 'default' : 'outline'}
                    size="sm"
                    className="bg-white"
                    onClick={() => setTheme('claro')}
                    disabled={loading}
                  >
                    ☀️ Claro
                  </Button>
                  <Button
                    variant={theme === 'escuro' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('escuro')}
                    disabled={loading}
                  >
                    🌙 Escuro
                  </Button>
                  <Button
                    variant={theme === 'sistema' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('sistema')}
                    disabled={loading}
                  >
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
                <Button variant="destructive">Excluir Conta</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}