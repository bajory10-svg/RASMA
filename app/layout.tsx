import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'RASMA Stickers',
  description: 'Business management for RASMA Stickers',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RASMA Stickers',
  },
}

export const viewport: Viewport = {
  themeColor: '#d4841e',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  console.log('RootLayout: Fetching user session...')
  let user = null
  try {
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.getUser()
    user = data?.user
    console.log('RootLayout: User fetch complete. User logged in:', !!user)
    if (authError) {
      console.log('RootLayout: Auth error returned:', authError)
    }
  } catch (error) {
    console.error('RootLayout: Error fetching user:', error)
  }

  return (
    <html lang="en">
      <body>
        {user ? (
          <div className="flex h-screen overflow-hidden">
            <Sidebar user={user} />
            <main className="flex-1 overflow-y-auto bg-[#fafaf9]">
              <div className="p-4 md:p-8 max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        ) : (
          <main className="min-h-screen bg-[#fafaf9]">
            {children}
          </main>
        )}
      </body>
    </html>
  )
}
