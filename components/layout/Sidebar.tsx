'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Package, Archive, Users,
  ShoppingBag, Receipt, Menu, X, LogOut, Wallet
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const links = [
  { href: '/',           label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/products',   label: 'Products',   icon: Package },
  { href: '/inventory',  label: 'Inventory',  icon: Archive },
  { href: '/customers',  label: 'Customers',  icon: Users },
  { href: '/orders',     label: 'Orders',     icon: ShoppingBag },
  { href: '/expenses',   label: 'Expenses',   icon: Wallet },
]

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const NavLinks = () => (
    <>
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
              active
                ? 'bg-brand-500 text-white font-medium'
                : 'text-surface-500 hover:text-surface-900 hover:bg-surface-100'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-surface-200 px-4 h-14 flex items-center justify-between">
        <span className="font-display text-xl text-surface-900 tracking-widest">HENNA</span>
        <button onClick={() => setOpen(!open)} className="p-2 text-surface-500">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-14">
          <nav className="flex flex-col gap-1 p-4">
            <NavLinks />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-500 hover:bg-red-50 mt-4"
            >
              <LogOut size={18} />
              Log out
            </button>
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-surface-200 h-screen sticky top-0">
        <div className="px-6 py-8 border-b border-surface-100">
          <h1 className="font-display text-2xl tracking-widest text-surface-900">HENNA</h1>
          <p className="text-xs text-surface-400 mt-1 tracking-wide">Business Dashboard</p>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
          <NavLinks />
        </nav>

        <div className="p-4 border-t border-surface-100">
          <p className="text-xs text-surface-400 truncate mb-3 px-2">{user.email}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-400 hover:text-red-600 hover:bg-red-50 w-full transition-all"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile content padding */}
      <div className="md:hidden h-14" />
    </>
  )
}
