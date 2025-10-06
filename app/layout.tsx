import type { Metadata } from 'next'
import { Poppins, Fredoka } from 'next/font/google'
import './globals.css'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka'
})

export const metadata: Metadata = {
  title: 'Math Adventure - Fun Learning for Kids!',
  description: 'AI-powered math problem generator that makes learning fun for Primary 5 students! Join the math adventure!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${fredoka.variable}`}>
      <body className={poppins.className}>
        {children}
      </body>
    </html>
  )
}