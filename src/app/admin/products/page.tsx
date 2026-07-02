'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data)
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  const handleToggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ active: !current }).eq('id', id)
    fetchProducts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await supabase.from('orders').update({ product_id: null }).eq('product_id', id)
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  if (loading) return <div className="flex justify-center py-20">Loading...</div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <Link href="/admin/products/new" className="bg-[#ea580c] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-orange-700">
            <Plus size={18} /> Add Product
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-500 border-b bg-gray-50"><tr><th className="p-3">Image</th><th className="p-3">Name</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3"><img src={p.images?.[0] || ''} className="w-10 h-10 object-cover rounded" /></td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">₹{p.price}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${p.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{p.active ? 'Active' : 'Draft'}</span></td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => handleToggleActive(p.id, p.active)} className="p-1 hover:bg-gray-100 rounded">{p.active ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    <Link href={`/admin/products/edit/${p.id}`} className="p-1 hover:bg-gray-100 rounded"><Pencil size={16} /></Link>
                    <button onClick={() => handleDelete(p.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
