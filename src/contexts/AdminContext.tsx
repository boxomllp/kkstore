'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'

interface AdminContextType {
  user: User | null
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  logout: () => void
}
const AdminContext = createContext<AdminContextType>({ user: null, isAdmin: false, loading: true, login: async () => null, logout: () => {} })
export const useAdmin = () => useContext(AdminContext)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAdmin = async (uid: string) => {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', uid).single()
    setIsAdmin(data?.role === 'admin')
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) checkAdmin(session.user.id)
      else setLoading(false)
    })
    const { data: { sub } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) checkAdmin(session.user.id)
      else { setIsAdmin(false); setLoading(false) }
    })
    return () => sub.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message || null
  }

  const logout = () => { supabase.auth.signOut(); setIsAdmin(false) }

  return <AdminContext.Provider value={{ user, isAdmin, loading, login, logout }}>{children}</AdminContext.Provider>
}
