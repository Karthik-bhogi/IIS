import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Internship Intelligence System (IIS)',
  description: 'Track your daily work, meetings, connections, and generate impact.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased text-slate-600 bg-slate-50`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
