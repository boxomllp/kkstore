'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStoreSettings } from '@/contexts/StoreContext'
import Link from 'next/link'

export default function Footer() {
  const { settings } = useStoreSettings()
  const [pages, setPages] = useState<any[]>([])

  useEffect(() => {
    supabase.from('pages').select('slug, title').eq('show_in_footer', true).order('title').then(res => setPages(res.data || []))
  }, [])

  return (
    <footer className="mt-12 border-t" style={{ backgroundColor: settings.footer_bg_color || '#f9fafb', color: settings.footer_text_color || '#374151' }}>
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-3">{settings.store_name || 'KK Store'}</h3>
          <p className="text-sm opacity-80">{settings.footer_description || 'Best products in India.'}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm">
            {pages.map(p => (
              <Link key={p.slug} href={`/${p.slug}`} className="hover:underline">{p.title}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Connect</h4>
          <div className="flex flex-col gap-2 text-sm">
            {settings.social_instagram && <a href={settings.social_instagram} target="_blank" className="hover:underline">Instagram</a>}
            {settings.social_facebook && <a href={settings.social_facebook} target="_blank" className="hover:underline">Facebook</a>}
            {settings.social_whatsapp && <a href={`https://wa.me/${settings.social_whatsapp}`} target="_blank" className="hover:underline">WhatsApp</a>}
          </div>
        </div>
      </div>
      <div className="border-t text-center py-4 text-sm opacity-70">
        © {new Date().getFullYear()} {settings.store_name || 'KK Store'}. {settings.footer_copyright || 'All rights reserved.'}
      </div>
    </footer>
  )
}
