'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import TipTapEditor from './TipTapEditor'
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react'

export default function ProductForm({ product }: { product?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', short_description: '', description_html: '', ingredients_html: '',
    how_to_use_html: '', price: '', compare_price: '', stock: '', sku: '',
    meta_title: '', meta_description: '', active: true
  })
  const [images, setImages] = useState<string[]>([])
  const [faqs, setFaqs] = useState<any[]>([])
  const [variants, setVariants] = useState({ enabled: false, label: '', options: [] as any[] })
  const [badges, setBadges] = useState([{icon:'🚚',text:'Free Shipping'},{icon:'💰',text:'COD'},{icon:'🔄',text:'Easy Returns'}])

  useEffect(() => {
    if (product) {
      setForm(p => ({...p, ...product, price: String(product.price||''), compare_price: String(product.compare_price||'') }))
      setImages(product.images || [])
      setFaqs(product.faqs || [])
      setVariants(product.variants || { enabled: false, label: '', options: [] })
      setBadges(product.trust_badges || badges)
    }
  }, [product])
    const handleSlug = (name: string) => {
    setForm(p => ({ ...p, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }))
  }

  const addImage = () => {
    const url = prompt('Image URL:')
    if (url) setImages(prev => [...prev, url])
  }

  const addFaq = () => setFaqs(prev => [...prev, { question: '', answer: '' }])
  const updateFaq = (i: number, key: string, val: string) => {
    const newFaqs = [...faqs]; newFaqs[i][key] = val; setFaqs(newFaqs)
  }
  const removeFaq = (i: number) => setFaqs(prev => prev.filter((_, idx) => idx !== i))

  const addVariant = () => setVariants(p => ({ ...p, options: [...p.options, { name: '', price: '0', compare_price: '0', default: false }] }))
  const updateVariant = (i: number, key: string, val: any) => {
    const newOpts = [...variants.options]; newOpts[i] = { ...newOpts[i], [key]: val }; setVariants(p => ({ ...p, options: newOpts }))
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded"><ArrowLeft size={24} /></button>
        <h1 className="text-2xl font-bold">{product ? 'Edit Product' : 'Add Product'}</h1>
      </div>
      <div className="grid grid-cols-1 lg:
                <div>
            <label className="block text-sm font-medium mb-1">Short Description (Bullet points)</label>
            <textarea value={form.short_description} onChange={e => setForm(p => ({...p, short_description: e.target.value}))} rows={4} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500" placeholder="One point per line..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Selling Price (INR)</label>
              <input type="number" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compare Price / MRP</label>
              <input type="number" value={form.compare_price} onChange={e => setForm(p => ({...p, compare_price: e.target.value}))} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Images</label>
              <button type="button" onClick={addImage} className="text-[#ea580c] text-sm flex items-center gap-1"><Plus size={16}/> Add Image URL</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 border rounded-lg overflow-hidden group">
                  <img src={img} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100"><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <TipTapEditor initialContent={form.description_html} onChange={html => setForm(p => ({...p, description_html: html}))} />
          </div>
                      <div>
            <label className="block text-sm font-medium mb-2">Ingredients</label>
            <TipTapEditor initialContent={form.ingredients_html} onChange={html => setForm(p => ({...p, ingredients_html: html}))} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">How to Use</label>
            <TipTapEditor initialContent={form.how_to_use_html} onChange={html => setForm(p => ({...p, how_to_use_html: html}))} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">FAQs</label>
              <button type="button" onClick={addFaq} className="text-[#ea580c] text-sm flex items-center gap-1"><Plus size={16}/> Add FAQ</button>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border p-3 rounded-lg space-y-2 relative">
                  <button type="button" onClick={() => removeFaq(i)} className="absolute top-2 right-2 text-red-500"><Trash2 size={16}/></button>
                  <input value={faq.question} onChange={e => updateFaq(i, 'question', e.target.value)} placeholder="Question" className="w-full border rounded p-2 text-sm outline-none" />
                  <textarea value={faq.answer} onChange={e => updateFaq(i, 'answer', e.target.value)} placeholder="Answer" rows={2} className="w-full border rounded p-2 text-sm outline-none" />
                </div>
              ))}
            </div>
          </div>

          <div className="border p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <input type="checkbox" checked={variants.enabled} onChange={e => setVariants(p => ({...p, enabled: e.target.checked}))} className="w-5 h-5 accent-[#ea580c]" />
              <label className="font-medium">Enable Variants</label>
            </div>
            {variants.enabled && (
              <div className="space-y-3">
                <input value={variants.label} onChange={e => setVariants(p => ({...p, label: e.target.value}))} placeholder="e.g. Choose your Pack" className="w-full border rounded p-2 text-sm outline-none" />
                {variants.options.map((opt, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 items-end">
                    <input value={opt.name} onChange={e => updateVariant(i, 'name', e.target.value)} placeholder="Name" className="col-span-2 border rounded p-2 text-sm outline-none" />
                    <input type="number" value={opt.price} onChange={e => updateVariant(i, 'price', e.target.value)} placeholder="Price" className="border rounded p-2 text-sm outline-none" />
                    <button type="button" onClick={() => setVariants(p => ({...p, options: p.options.filter((_,idx)=>idx!==i)}))} className="text-red-500 p-2"><Trash2 size={16}/></button>
                  </div>
                ))}
                <button type="button" onClick={addVariant} className="text-sm text-[#ea580c]">+ Add Option</button>
              </div>
            )}
          </div>
                    </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border p-4 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm(p => ({...p, stock: e.target.value}))} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input value={form.sku} onChange={e => setForm(p => ({...p, sku: e.target.value}))} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={String(form.active)} onChange={e => setForm(p => ({...p, active: e.target.value === 'true'}))} className="w-full border rounded-lg p-3 outline-none bg-white">
                <option value="true">Active</option>
                <option value="false">Draft</option>
              </select>
            </div>
          </div>

          <div className="border p-4 rounded-lg space-y-4">
            <h3 className="font-medium">SEO</h3>
            <input value={form.meta_title} onChange={e => setForm(p => ({...p, meta_title: e.target.value}))} placeholder="Meta Title" className="w-full border rounded-lg p-3 outline-none text-sm" />
            <textarea value={form.meta_description} onChange={e => setForm(p => ({...p, meta_description: e.target.value}))} placeholder="Meta Description" rows={3} className="w-full border rounded-lg p-3 outline-none text-sm" />
          </div>

          <div className="border p-4 rounded-lg space-y-3">
            <h3 className="font-medium">Trust Badges</h3>
            {badges.map((b, i) => (
              <div key={i} className="flex gap-2">
                <input value={b.icon} onChange={e => { const nb=[...badges]; nb[i].icon=e.target.value; setBadges(nb); }} className="w-16 border rounded p-2 text-center text-sm outline-none" />
                <input value={b.text} onChange={e => { const nb=[...badges]; nb[i].text=e.target.value; setBadges(nb); }} className="flex-1 border rounded p-2 text-sm outline-none" />
              </div>
            ))}
          </div>

          <button
            disabled={loading}
            onClick={async () => {
              setLoading(true)
              const payload = { ...form, price: Number(form.price), compare_price: Number(form.compare_price) || null, stock: Number(form.stock), images, faqs, variants, trust_badges: badges }
              if (product) { await supabase.from('products').update(payload).eq('id', product.id) }
              else { await supabase.from('products').insert([payload]) }
              setLoading(false); router.push('/admin/products')
            }}
            className="w-full bg-[#ea580c] text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-700 disabled:opacity-50"
          >
            <Save size={20} /> {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  )
}
