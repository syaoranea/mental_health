
'use client'

import { Users, Mail, Shield, Plus, Check, X, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/header').then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => <div className="h-16 bg-white border-b border-gray-200"></div>
})

export function SharePageClient() {
  const sharedAccess = [
    {
      id: '1',
      email: 'dra.silva@clinica.com',
      status: 'ACCEPTED',
      invitedAt: '2024-10-15',
      type: 'Profissional'
    },
    {
      id: '2', 
      email: 'mae@email.com',
      status: 'PENDING',
      invitedAt: '2024-10-20',
      type: 'Familiar'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Compartilhamento
          </h1>
          <p className="text-gray-600">
            Compartilhe seus registros com profissionais de saúde e familiares de confiança
          </p>
        </div>

        {/* Privacy Notice */}
        <Card className="mb-8 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Sua Privacidade em Primeiro Lugar</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Você controla quem tem acesso aos seus dados</li>
                  <li>• Registros marcados como "privados" nunca são compartilhados</li>
                  <li>• Você pode revogar o acesso a qualquer momento</li>
                  <li>• Todas as pessoas convidadas precisam aceitar o convite</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add New Share */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Convidar Nova Pessoa
            </CardTitle>
            <CardDescription>
              Envie um convite por email para compartilhar seus registros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email da pessoa</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="profissional@clinica.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo de acesso</Label>
                <select 
                  id="type"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="profissional">Profissional de Saúde</option>
                  <option value="familiar">Familiar/Cuidador</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>
            <Button className="w-full sm:w-auto">
              <Mail className="w-4 h-4 mr-2" />
              Enviar Convite
            </Button>
          </CardContent>
        </Card>

        {/* Current Shares */}
        <Card>
          <CardHeader>
            <CardTitle>Acesso Compartilhado</CardTitle>
            <CardDescription>
              Pessoas que têm ou solicitaram acesso aos seus registros
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sharedAccess.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Você ainda não compartilhou seus dados com ninguém</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sharedAccess.map((access) => (
                  <div 
                    key={access.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{access.email}</p>
                          <p className="text-sm text-gray-600">
                            Convidado em {new Date(access.invitedAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {access.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {access.status === 'ACCEPTED' && (
                        <Badge variant="default" className="gap-1">
                          <Check className="w-3 h-3" />
                          Ativo
                        </Badge>
                      )}
                      {access.status === 'PENDING' && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="w-3 h-3" />
                          Pendente
                        </Badge>
                      )}
                      {access.status === 'DECLINED' && (
                        <Badge variant="destructive" className="gap-1">
                          <X className="w-3 h-3" />
                          Recusado
                        </Badge>
                      )}
                      
                      <Button variant="outline" size="sm">
                        Revogar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
