
'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Heart, Menu, X, Plus, BarChart3, Users, Settings, LogOut, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function Header() {
  const { data: session, status } = useSession() || { data: null, status: 'loading' }
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // or a loading skeleton
  }

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false })
      toast.success('Até logo! Cuide-se sempre.')
      router.push('/')
    } catch (error) {
      toast.error('Erro ao sair da conta')
    }
  }

  const menuItems = [
    {
      icon: Plus,
      label: 'Registrar Humor',
      href: '/registrar',
      description: 'Novo registro'
    },
    {
      icon: BarChart3,
      label: 'Relatórios',
      href: '/relatorios',
      description: 'Visualizar dados'
    },
    {
      icon: Users,
      label: 'Compartilhar',
      href: '/compartilhar',
      description: 'Gerenciar acesso'
    },
    {
      icon: Settings,
      label: 'Configurações',
      href: '/configuracoes',
      description: 'Preferências'
    }
  ]

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Heart className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-gray-900">MeuRefúgio</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}

            {/* Emergency Button */}
            <Link href="/emergencia">
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 text-red-500"
              >
                <AlertCircle className="w-4 h-4" />
                Emergência
              </Button>
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/configuracoes" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/compartilhar" className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Compartilhamento</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 h-auto py-3"
                  >
                    <item.icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Button>
                </Link>
              ))}
              
              <Link 
                href="/emergencia"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-auto py-3 text-red-600 hover:bg-red-50"
                >
                  <AlertCircle className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Recursos de Emergência</div>
                    <div className="text-xs text-red-500">Apoio 24h disponível</div>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
