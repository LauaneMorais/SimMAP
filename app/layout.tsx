import type { Metadata } from 'next'
import { MuseoModerno, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'


const museo = MuseoModerno({ 
  subsets: ["latin"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono' 
});

export const metadata: Metadata = {
  title: 'LAWD - Mapeamento de Membros',
  description: 'Painel de mapeamento de perfis da Liga Acadêmica de Desenvolvimento Web',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      {}
      <body className={`${museo.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}