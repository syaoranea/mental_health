
'use client'

import { AlertCircle, Heart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmergencyResources } from '@/components/emergency-resources'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/header').then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => <div className="h-16 bg-white border-b border-gray-200"></div>
})

export function EmergencyPageClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-blue-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Recursos de Emergência
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Se você está passando por um momento difícil ou em crise, 
            há pessoas prontas para ajudar. Não hesite em buscar apoio profissional.
          </p>
        </div>

        <EmergencyResources />

        {/* Additional Information */}
        <div className="mt-12 space-y-6">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Importante Lembrar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-blue-800">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Sinais de Alerta:</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Pensamentos de autolesão</li>
                    <li>• Desesperança persistente</li>
                    <li>• Isolamento social extremo</li>
                    <li>• Perda de interesse em tudo</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">O que Fazer:</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Ligue para os números de apoio</li>
                    <li>• Procure um hospital ou UPA</li>
                    <li>• Entre em contato com familiar</li>
                    <li>• Não tome decisões importantes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">
                Como Ajudar Alguém em Crise
              </CardTitle>
              <CardDescription className="text-green-600">
                Se você conhece alguém que precisa de ajuda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-green-800">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Escute</h4>
                  <p className="text-green-700">
                    Ofereça uma escuta sem julgamentos e com empatia
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Encoraje</h4>
                  <p className="text-green-700">
                    Incentive a buscar ajuda profissional
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Acompanhe</h4>
                  <p className="text-green-700">
                    Ofereça-se para acompanhar em consultas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-block p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">
              🌟 Lembre-se: Procurar ajuda é um sinal de força, não de fraqueza
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
