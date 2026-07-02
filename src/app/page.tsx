'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStoreSettings } from '@/contexts/StoreContext'
import { Truck, ShieldCheck, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import StoreLayout from '@/components/storefront/StoreLayout'

export default function HomePage() {
  const { settings, loading } = useStoreSettings()
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    if (settings.featured_products) {
      try {
        const ids = JSON.parse(settings.featured_products as string)
        if (ids.length > 0) {
          supabase.from('products').select('*').in('id', ids).eq('active', true).then(res => setProducts(res.data || []))
        }
      } catch (e) {}
    }
  }, [settings])

  if (loading) return <div className="flex justify-center py-20 text-gray-500">Loading...</div>

  return (
    <StoreLayout>
      <main>
        {/* Hero Section */}
        <section className="relative bg-gray-50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 text-center">
            {settings.hero_image && (
              <div className="relative w-full h-64 md:h-96 mb-8 mx-auto max-w-3xl rounded-xl overflow-hidden shadow-lg">
                <img src={settings.hero_image} alt="Hero" className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
              {settings.hero_headline || 'Amazing Products for You'}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {settings.hero_subheadline || 'Shop the best quality products at amazing prices.'}
            </p>
            {settings.hero_cta_text && (
              <Link
                href={settings.hero_cta_link || '/products'}
                className="inline-block bg-[#ea580c] text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-orange-700 transition shadow-lg"
              >
                {settings.hero_cta_text}
              </Link>
            )}
          </div>
        </section>

        {/* Featured Products Grid (2 cols mobile, 4 cols desktop) */}
        {products.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Featured Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map(p => (
                <Link key={p.id} href={`/products/${p.slug}`} className="group border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition bg-white">
                  <div className="relative w-full aspect-square bg-gray-100">
                    <img src={p.images?.[0] || 'https://via.placeholder.com/400'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    {p.compare_price && (
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {Math.round(((p.compare_price - p.price) / p.compare_price) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">₹{p.price}</span>
                      {p.compare_price && <span className="text-sm text-gray-400 line-through">₹{p.compare_price}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trust Bar */}
        <section className="border-t border-b bg-white">
          <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2 text-gray-700">
              <Truck className="w-8 h-8 text-[#ea580c]" />
              <span className="font-semibold">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-gray-700">
              <ShieldCheck className="w-8 h-8 text-[#ea580c]" />
              <span className="font-semibold">Cash on Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-gray-700">
              <RotateCcw className="w-8 h-8 text-[#ea580c]" />
              <span className="font-semibold">Easy Returns</span>
            </div>
          </div>
        </section>
      </main>
    </StoreLayout>
  )
}
