'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([])
  const [stats, setStats] = useState({ today: 0, week: 0, revenue: 0, pending: 0, verified: 0 })

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100)
      if (data) {
        setOrders(data.slice(0, 10))
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const todayStr = now.toISOString().split('T')[0]
        setStats({
          today: data.filter(o => o.created_at?.startsWith(todayStr)).length,
          week: data.filter(o => new Date(o.created_at) >= weekAgo).length,
          revenue: data.reduce((sum, o) => sum + Number(o.product_price), 0),
          pending: data.filter(o => o.status === 'pending').length,
          verified: data.filter(o => o.verification_status === 'verified').length
        })
      }
    }
    fetch()
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 ml-64">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[{l:"Today's Orders",v:stats.today},{l:"Week Orders",v:stats.week},{l:"Revenue",v:`₹${stats.revenue}`},{l:"Pending",v:stats.pending},{l:"Verified",v:stats.verified}].map((s,i)=>(
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border"><p className="text-sm text-gray-500">{s.l}</p><p className="text-2xl font-bold mt-1">{s.v}</p></div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <h2 className="font-bold p-4 border-b">Recent Orders</h2>
          <table className="w-full text-sm text-left">
            <thead className="text-gray-500 border-b"><tr><th className="p-3">Order #</th><th className="p-3">Customer</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr></thead>
            <tbody>{orders.map(o=>(
              <tr key={o.id} className="border-b hover:bg-gray-50"><td className="p-3 font-medium">#{o.order_number}</td><td className="p-3">{o.customer_name}</td><td className="p-3">₹{o.product_price}</td><td className="p-3"><span className={`px-2 py-1 rounded text-xs ${o.status==='pending'?'bg-amber-100 text-amber-800':'bg-green-100 text-green-800'}`}>{o.status}</span></td></tr>
            ))}</tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
