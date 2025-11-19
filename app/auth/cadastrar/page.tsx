
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Heart, Mail, Lock, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'


export default function SignUpPage() {

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    gender: '',
  })


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

   /* 
      // Validation
      if (!formData.name || !formData.email || !formData.password) {
        toast.error('Todos os campos são obrigatórios')
        return
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('As senhas não coincidem')
        return
      }

      if (formData.password.length < 8) {
        toast.error('A senha deve ter pelo menos 8 caracteres')
        return
      }

      if (!agreeTerms) {
        toast.error('Você deve aceitar os termos de uso')
        return
      }

      
      try {
        await signUp(formData.email, formData.password, {
          name: formData.name,
          birthdate: formData.birthdate,
          gender: formData.gender,
          picture: 'https://meurefugio.app/default-avatar.png',
        });

        toast.success('Cadastro iniciado! Verifique seu e-mail para confirmar o código');
        router.push('/auth/confirmar');
      } catch (e: any) {
        toast.error('Erro ao criar conta');
        alert(e?.message ?? 'Erro no cadastro');
      } */

      

      // Create account
      /* const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Erro ao criar conta')
        return
      }

    
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.ok) {
        toast.success('Conta criada com sucesso! Bem-vindo!')
        router.push('/dashboard')
      } else {
        toast.success('Conta criada com sucesso! Faça login para continuar.')
        router.push('/auth/entrar')
      }
    } catch (error) {
      toast.error('Erro ao criar conta. Tente novamente.')
    } finally { }*/
      
    setIsLoading(false)
  }
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleTermsChange = (checked: boolean | 'indeterminate') => {
    setAgreeTerms(checked === true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sua jornada começa aqui
          </h1>
          <p className="text-gray-600 mt-2">
            Crie sua conta e cuide do seu bem-estar mental
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Criar Conta</CardTitle>
            <CardDescription className="text-center">
              Junte-se ao MeuRefúgio gratuitamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">Data de Nascimento</Label>
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gênero</Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => handleChange(e as any)}
                  className="w-full border rounded-md p-2 text-sm"
                  disabled={isLoading}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Digite a senha novamente"
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={handleTermsChange}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  Concordo em usar esta aplicação de forma responsável e entendo que ela não substitui acompanhamento médico profissional
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !agreeTerms}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Já tem uma conta? </span>
              <Link
                href="/auth/entrar"
                className="text-primary hover:underline font-medium"
              >
                Faça login
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Seus dados são protegidos e criptografados
          </p>
        </div>
      </div>
    </div>
  )
}
