'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/contexts/AdminContext'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAdmin, loading: authLoading } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && isAdmin) router.push('/admin/dashboard')
  }, [isAdmin, authLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const err = await login(email, password)
    if (err) setError(err)
    setLoading(false)
  }

  if (authLoading) return <div className="flex justify-center py-20 text-gray-500">Checking...</div>

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Login</h1>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
