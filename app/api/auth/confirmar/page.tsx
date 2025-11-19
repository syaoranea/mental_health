'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, CheckCircle2, Mail, KeyRound } from 'lucide-react'


export default function ConfirmSignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    code: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

   /*  try {
      await confirmUser(formData.email, formData.code)
      toast.success('Conta confirmada com sucesso! 🎉')
      router.push('/auth/entrar')
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Erro ao confirmar conta')
    } finally {
      setIsLoading(false)
    } */
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">
              Confirmar Cadastro
            </CardTitle>
            <CardDescription>
              Insira o código de verificação enviado para seu e-mail
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Código de Confirmação</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    placeholder="Ex: 123456"
                    value={formData.code}
                    onChange={handleChange}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Confirmando...' : 'Confirmar Conta'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Não recebeu o código?</p>
              <button
                type="button"
                className="text-primary font-medium hover:underline mt-1"
                onClick={() => toast.info('Verifique sua caixa de spam ou reenvie o código.')}
              >
                Reenviar código
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

