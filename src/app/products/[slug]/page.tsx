'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useStoreSettings } from '@/contexts/StoreContext'
import { firePixelEvent } from '@/hooks/usePixel'
import StoreLayout from '@/components/storefront/StoreLayout'
import DeliveryTimeline from '@/components/storefront/DeliveryTimeline'
import { Check, ShieldCheck, Lock, Headphones } from 'lucide-react'
import * as Accordion from '@radix-ui/react-accordion'

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { settings } = useStoreSettings()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mainImage, setMainImage] = useState('')
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const buyNowRef = useRef<HTMLButtonElement>(null)

  // Fetch Product
  useEffect(() => {
    supabase.from('products').select('*').eq('slug', params.slug).eq('active', true).single().then(res => {
      if (res.data) {
        setProduct(res.data)
        setMainImage(res.data.images?.[0] || '')
        if (res.data.variants?.enabled) {
          const def = res.data.variants.options.find((o: any) => o.default)
          setSelectedVariant(def || res.data.variants.options[0] || null)
        }
        firePixelEvent('ViewContent', { content_name: res.data.name, value: res.data.price, currency: 'INR' })
      }
      setLoading(false)
    })
  }, [params.slug])

  // Sticky Bar Logic: getBoundingClientRect (NOT IntersectionObserver)
  useEffect(() => {
    const handleScroll = () => {
      if (buyNowRef.current) {
        const rect = buyNowRef.current.getBoundingClientRect()
        // Agar button viewport se upar chala gaya
        setShowStickyBar(rect.bottom < 0)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) return <StoreLayout><div className="flex justify-center py-20 text-gray-500">Loading Product...</div></StoreLayout>
  if (!product) return <StoreLayout><div className="text-center py-20 text-gray-500">Product not found</div></StoreLayout>

  const currentPrice = selectedVariant ? selectedVariant.price : product.price
  const currentComparePrice = selectedVariant ? selectedVariant.compare_price : product.compare_price
  const discount = currentComparePrice ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100) : 0

  const handleBuyNow = () => {
    firePixelEvent('AddToCart') // Popup open event
    alert('Buy Now Popup will open here! (Next part)')
  }

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* LEFT: Image Gallery */}
          <div>
            <div className="w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images?.map((img: string, i: number) => (
                <button key={i} onClick={() => setMainImage(img)} className={`aspect-square rounded-lg overflow-hidden border-2 transition ${mainImage === img ? 'border-[#ea580c]' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-extrabold text-gray-900">₹{currentPrice}</span>
              {currentComparePrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">₹{currentComparePrice}</span>
                  <span className="bg-green-100 text-green-800 text-sm font-bold px-2 py-1 rounded">{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Short Description Bullets */}
            {product.short_description && (
              <div className="mb-6 space-y-2">
                {product.short_description.split('\n').filter(Boolean).map((line: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#ea580c] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{line.replace(/^- /, '')}</span>
                  </div>
                ))}
              </div>
            )}

            {/* VARIANT SELECTOR */}
            {product.variants?.enabled && (
              <div className="mb-6">
                <p className="font-semibold text-gray-900 mb-3">{product.variants.label || 'Choose your Pack'}</p>
                <div className="flex flex-wrap gap-3">
                  {product.variants.options.map((opt: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariant(opt)}
                      className={`px-5 py-3 rounded-full text-sm font-bold border-2 transition-all ${
                        selectedVariant?.name === opt.name
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
                      }`}
                    >
                      {opt.name} - ₹{opt.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* BUY IT NOW BUTTON (With Ref for sticky bar) */}
            <button
              ref={buyNowRef}
              onClick={handleBuyNow}
              className="w-full bg-[#ea580c] text-white font-extrabold text-[22px] py-5 rounded-[999px] animate-pulse-orange hover:bg-orange-700 transition shadow-lg mb-6"
            >
              Buy It Now — ₹{currentPrice}
            </button>

            {/* Delivery Timeline */}
            <div className="border border-gray-200 rounded-xl p-6 mb-6">
              <DeliveryTimeline 
                readyDays={settings.delivery_ready_days || '1'} 
                deliveryDays={settings.delivery_days || '4'} 
              />
            </div>

            {/* Trusted Business Badge */}
            <div className="border border-green-200 bg-green-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 text-green-800 font-bold text-lg mb-4">
                <ShieldCheck className="w-6 h-6" /> Trusted Business
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm text-green-700">
                <div><Lock className="w-5 h-5 mx-auto mb-1" /> Verified Business</div>
                <div><ShieldCheck className="w-5 h-5 mx-auto mb-1" /> Secured Payments</div>
                <div><Headphones className="w-5 h-5 mx-auto mb-1" /> Prompt Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* BELOW FOLD TABS */}
        <div className="mt-12 border-t">
          <div className="flex gap-8 border-b mb-6">
            {['description', 'ingredients', 'how_to_use', 'faqs'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold capitalize transition ${activeTab === tab ? 'text-[#ea580c] border-b-2 border-[#ea580c]' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="max-w-4xl">
            {(activeTab === 'description' || activeTab === 'ingredients' || activeTab === 'how_to_use') && (
              <div 
                className="rich-content text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product[`${activeTab}_html`] || '<p>No content added yet.</p>' }}
              />
            )}

            {activeTab === 'faqs' && (
              <Accordion.Root type="single" collapsible className="space-y-4">
                {product.faqs?.length > 0 ? product.faqs.map((faq: any, i: number) => (
                  <Accordion.Item key={i} value={`item-${i}`} className="border rounded-lg overflow-hidden">
                    <Accordion.Trigger className="w-full flex items-center justify-between p-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition">
                      {faq.question}
                    </Accordion.Trigger>
                    <Accordion.Content className="p-4 text-gray-600 bg-gray-50 border-t">
                      <div className="rich-content" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                    </Accordion.Content>
                  </Accordion.Item>
                )) : <p className="text-gray-500">No FAQs added yet.</p>}
              </Accordion.Root>
            )}
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] min-h-[64px] flex items-center justify-between px-4 py-3 md:px-8">
          <div className="flex-1 pr-4 truncate">
            <p className="font-bold text-gray-900 truncate">{product.name}</p>
            <p className="text-sm text-gray-500">₹{currentPrice} {currentComparePrice && <span className="line-through ml-1">₹{currentComparePrice}</span>}</p>
          </div>
          <button
            onClick={handleBuyNow}
            className="bg-[#ea580c] text-white font-bold py-3 px-6 rounded-[999px] animate-pulse-orange hover:bg-orange-700 transition text-sm md:text-base flex-shrink-0"
          >
            Buy It Now
          </button>
        </div>
      )}
    </StoreLayout>
  )
}
