'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdmin } from '@/contexts/AdminContext'
import { LayoutDashboard, ShoppingBag, ClipboardList, FileText, Settings, MousePointerClick, BarChart3, LogOut } from 'lucide-react'

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: ShoppingBag },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/pages', label: 'Pages', icon: FileText },
  { href: '/admin/settings', label: 'Store Settings', icon: Settings },
  { href: '/admin/popup', label: 'Popup & Form', icon: MousePointerClick },
  { href: '/admin/pixels', label: 'Pixel Manager', icon: BarChart3 }
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAdmin()

  return (
    <aside className="w-64 min-h-screen bg-[#111] text-white flex flex-col p-4 fixed left-0 top-0 z-40">
      <h2 className="text-xl font-bold mb-8 px-2 text-[#ea580c]">Admin Panel</h2>
      <nav className="flex-1 space-y-1">
        {links.map(link => {
          const isActive = pathname === link.href
          return (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm font-medium ${isActive ? 'bg-[#ea580c] text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
              <link.icon size={20} />
              {link.label}
            </Link>
          )
        })}
      </nav>
      <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white mt-4">
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  )
}
