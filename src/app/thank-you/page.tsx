'use client'
import { useSearchParams } from 'next/navigation'
import StoreLayout from '@/components/storefront/StoreLayout'
import { CheckCircle } from 'lucide-react'

export default function ThankYouPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order') || 'N/A'
  const productName = searchParams.get('product') || 'Your Product'
  const price = searchParams.get('price') || '0'

  return (
    <StoreLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="bg-green-100 rounded-full p-4 mb-6">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Order Confirmed! 🎉</h1>
        <p className="text-gray-500 mb-8">Your order has been placed successfully</p>
        
        <div className="bg-white border rounded-2xl p-6 w-full max-w-md shadow-sm space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order Number</span>
            <span className="font-bold text-gray-900">#{orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Product</span>
            <span className="font-semibold text-gray-900">{productName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount</span>
            <span className="font-bold text-gray-900">₹{price}</span>
          </div>
        </div>
        
        <a href="/" className="mt-8 text-[#ea580c] font-semibold hover:underline">← Continue Shopping</a>
      </div>
    </StoreLayout>
  )
}
