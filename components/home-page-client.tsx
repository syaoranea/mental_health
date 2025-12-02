
'use client'

import { Heart, Target, Users, Shield, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default async function HomePageClient() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">MeuRefúgio</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/entrar">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/auth/cadastrar">
                <Button size="sm">
                  Começar agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-8">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Sua jornada de <span className="text-primary">bem-estar mental</span> começa aqui
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Registre seu humor, acompanhe suas emoções e compartilhe seu progresso 
            de forma segura e privada. Você no controle da sua saúde mental.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/cadastrar">
              <Button size="lg" className="w-full sm:w-auto">
                Criar conta gratuita
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/entrar">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Já tenho uma conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Por que escolher o MeuRefúgio?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Uma plataforma completa e acolhedora para cuidar da sua saúde mental
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: 'Registro Completo',
                description: 'Múltiplas formas de registrar humor: escala numérica, emojis, palavras e fotos'
              },
              {
                icon: Users,
                title: 'Compartilhamento Seguro',
                description: 'Compartilhe com profissionais e familiares com total controle de privacidade'
              },
              {
                icon: Star,
                title: 'Análises Inteligentes',
                description: 'Gráficos, calendários e identificação de padrões no seu bem-estar'
              },
              {
                icon: Shield,
                title: 'Privacidade Total',
                description: 'Seus dados são criptografados e você controla quem tem acesso'
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-md transition-shadow">
                <CardContent className="pt-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Resources Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recursos de Emergência Sempre Disponíveis
          </h2>
          <p className="text-gray-600 mb-8">
            Acesso rápido ao CVV, CAPS e outros recursos de apoio quando você precisar
          </p>
          <Card className="bg-gradient-to-r from-red-50 to-blue-50 border-red-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-8 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-red-600">CVV: 188</span>
                  <span>24h gratuito</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-600">CAPS: 136</span>
                  <span>Disque Saúde</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-gray-900">MeuRefúgio</span>
          </div>
          <p className="text-gray-600 mb-4">
            Cuidando do seu bem-estar mental com segurança e privacidade
          </p>
          <p className="text-sm text-gray-500">
            Esta aplicação não substitui acompanhamento médico profissional
          </p>
        </div>
      </footer>
    </div>
  )
}
