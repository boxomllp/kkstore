'use client'
import AnnouncementBar from './AnnouncementBar'
import Header from './Header'
import Footer from './Footer'
import { usePixel } from '@/hooks/usePixel'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  usePixel() // FB Pixel initialize hoga
  return (
    <>
      <AnnouncementBar />
      <Header />
      <div className="min-h-screen">{children}</div>
      <Footer />
    </>
  )
}
