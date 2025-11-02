
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MeuRefúgio - Monitoramento de Saúde Mental',
  description: 'Sua jornada de bem-estar mental em um só lugar. Registre, acompanhe e compartilhe seu progresso de forma segura e privada.',
  keywords: ['saúde mental', 'bem-estar', 'humor', 'monitoramento', 'apoio'],
  authors: [{ name: 'MeuRefúgio' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'MeuRefúgio - Monitoramento de Saúde Mental',
    description: 'Sua jornada de bem-estar mental em um só lugar',
    url: 'https://meurefugio.app',
    siteName: 'MeuRefúgio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MeuRefúgio - Monitoramento de Saúde Mental',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeuRefúgio - Monitoramento de Saúde Mental',
    description: 'Sua jornada de bem-estar mental em um só lugar',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
