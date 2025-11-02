
'use client'

import { Phone, ExternalLink, Heart, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function EmergencyResources() {
  const resources = [
    {
      name: 'CVV - Centro de Valorização da Vida',
      phone: '188',
      description: 'Apoio emocional 24h, gratuito',
      available: '24 horas',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      name: 'CAPS - Centros de Atenção Psicossocial',
      phone: '136',
      description: 'Disque Saúde - Informações sobre CAPS',
      available: '24 horas',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      name: 'SAMU - Emergência Médica',
      phone: '192',
      description: 'Emergências médicas graves',
      available: '24 horas',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    }
  ]

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Você não está sozinho
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Se você está passando por um momento difícil, há pessoas prontas para ajudar. 
          Não hesite em buscar apoio.
        </p>
      </div>

      <div className="grid gap-4">
        {resources.map((resource, index) => (
          <Card 
            key={index}
            className={`transition-all hover:shadow-md ${resource.borderColor}`}
          >
            <CardHeader className={`${resource.bgColor} rounded-t-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className={`text-lg ${resource.color}`}>
                    {resource.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {resource.description}
                  </CardDescription>
                </div>
                <Phone className={`w-6 h-6 ${resource.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Disponível:</p>
                  <p className="text-sm font-medium">{resource.available}</p>
                </div>
                <Button
                  onClick={() => handleCall(resource.phone)}
                  className={`${resource.color} bg-white border-2 ${resource.borderColor} hover:${resource.bgColor}`}
                  variant="outline"
                  size="sm"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {resource.phone}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="text-primary">Chat Online CVV</CardTitle>
              <CardDescription>
                Conversar por chat também é uma opção
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => window.open('https://www.cvv.org.br/quero-conversar/', '_blank')}
            className="w-full"
            variant="outline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Acessar Chat CVV
          </Button>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p className="font-medium mb-2">💙 Lembre-se:</p>
        <p>Procurar ajuda é um ato de coragem. Sua vida tem valor e há pessoas que se importam com você.</p>
      </div>
    </div>
  )
}
