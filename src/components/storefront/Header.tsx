'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStoreSettings } from '@/contexts/StoreContext'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const { settings } = useStoreSettings()
  const [pages, setPages] = useState<any[]>([])
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.from('pages').select('slug, title').eq('show_in_header', true).order('title').then(res => setPages(res.data || []))
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {settings.store_logo && <img src={settings.store_logo} alt="Logo" className="h-10 w-10 object-contain rounded" />}
          <span className="text-xl font-bold text-gray-900">{settings.store_name || 'KK Store'}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {pages.map(p => (
            <Link key={p.slug} href={`/${p.slug}`} className="text-gray-600 hover:text-gray-900 font-medium transition">{p.title}</Link>
          ))}
          <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">Admin</Link>
        </nav>

        {/* Mobile Toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-900">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 pb-4 space-y-2">
          {pages.map(p => (
            <Link key={p.slug} href={`/${p.slug}`} onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 font-medium">{p.title}</Link>
          ))}
        </div>
      )}
    </header>
  )
}
