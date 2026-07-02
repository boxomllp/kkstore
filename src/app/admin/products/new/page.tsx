'use client'
import Sidebar from '@/components/admin/Sidebar'
import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <ProductForm />
      </main>
    </div>
  )
}
