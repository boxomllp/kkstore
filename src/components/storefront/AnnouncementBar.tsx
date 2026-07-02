'use client'
import { useStoreSettings } from '@/contexts/StoreContext'
import { X } from 'lucide-react'
import { useState } from 'react'

export default function AnnouncementBar() {
  const { settings } = useStoreSettings()
  const [show, setShow] = useState(true)

  if (!show || settings.announcement_show === 'false') return null

  return (
    <div
      className="relative text-center py-2 px-4 text-sm flex items-center justify-center gap-2"
      style={{
        backgroundColor: settings.announcement_bg_color || '#ea580c',
        color: settings.announcement_text_color || '#ffffff'
      }}
    >
      {settings.announcement_link ? (
        <a href={settings.announcement_link} target="_blank" className="underline font-medium">
          {settings.announcement_text || 'Welcome to our store!'}
        </a>
      ) : (
        <span className="font-medium">{settings.announcement_text || 'Welcome to our store!'}</span>
      )}
      <button onClick={() => setShow(false)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  )
}
