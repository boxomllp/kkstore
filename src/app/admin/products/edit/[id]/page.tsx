'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import ProductForm from '@/components/admin/ProductForm'

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('products').select('*').eq('id', params.id).single().then(res => {
      setProduct(res.data)
      setLoading(false)
    })
  }, [params.id])

  if (loading) return <div className="ml-64 p-8">Loading...</div>
  if (!product) return <div className="ml-64 p-8">Product not found</div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <ProductForm product={product} />
      </main>
    </div>
  )
}
