'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface StoreSettings {
  [key: string]: string | boolean | null
}

const StoreContext = createContext<{
  settings: StoreSettings
  loading: boolean
}>({ settings: {}, loading: true })

export const useStoreSettings = () => useContext(StoreContext)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('store_settings').select('*')
      if (data) {
        const map: StoreSettings = {}
        data.forEach((item: { key: string; value: string }) => {
          map[item.key] = item.value
        })
        setSettings(map)
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  return (
    <StoreContext.Provider value={{ settings, loading }}>
      {children}
    </StoreContext.Provider>
  )
}
