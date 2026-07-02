'use client'
import { ShoppingCart, Package, Truck } from 'lucide-react'

export default function DeliveryTimeline({ readyDays = 1, deliveryDays = 4, compact = false }) {
  const today = new Date()
  const readyDate = new Date(today)
  readyDate.setDate(today.getDate() + parseInt(readyDays))
  const deliveryDate = new Date(today)
  deliveryDate.setDate(today.getDate() + parseInt(deliveryDays))

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const steps = [
    { icon: ShoppingCart, label: 'Ordered', date: formatDate(today) },
    { icon: Package, label: 'Order Ready', date: formatDate(readyDate) },
    { icon: Truck, label: 'Delivered', date: formatDate(deliveryDate) }
  ]

  return (
    <div className={`flex items-center justify-between ${compact ? 'text-xs' : 'text-sm'}`}>
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col items-center text-center flex-1">
          <div className="flex items-center w-full justify-center">
            <div className="flex flex-col items-center z-10">
              <div className="bg-orange-100 text-[#ea580c] rounded-full p-2 mb-1">
                <step.icon size={compact ? 14 : 18} />
              </div>
              <span className="font-semibold text-gray-900">{step.label}</span>
              <span className="text-gray-500">{step.date}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="h-[2px] bg-gray-200 flex-1 -ml-4 mr-2 mt-[-20px]"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
