'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function usePixel() {
  useEffect(() => {
    const initPixels = async () => {
      // 1. Inject FBQ IIFE Script FIRST
      const script = document.createElement('script')
      script.innerHTML = `!function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window,document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');`
      document.head.appendChild(script)

      // 2. Fetch active pixels from DB
      const { data: pixels } = await supabase
        .from('pixels')
        .select('*')
        .eq('active', true)

      if (pixels) {
        pixels.forEach(pixel => {
          if (pixel.test_mode) {
            console.log(`[FB Pixel TEST] Init: ${pixel.pixel_id}`)
          } else {
            // @ts-ignore
            window.fbq('init', pixel.pixel_id)
          }
        })
        
        if (pixels.some(p => !p.test_mode)) {
          // @ts-ignore
          window.fbq('track', 'PageView')
        }
      }
    }

    initPixels()
  }, [])
}

// Helper to fire events
export const firePixelEvent = (eventName: string, params?: object) => {
  // Fetch pixels to check test mode (simplified for client side)
  // @ts-ignore
  if (typeof window.fbq === 'function') {
    // Note: In production, you might cache test_mode status in context
    // @ts-ignore
    window.fbq('track', eventName, params)
  }
}
