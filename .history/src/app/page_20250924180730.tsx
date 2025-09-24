'use client'
import Hero from '@/components/home/Hero'
import Highlights from '@/components/home/Highlights'
import ServiceWorkflow from '@/components/home/ServiceWorkflow'
import AtelierExperience from '@/components/home/AtelierExperience'
import SignatureCare from '@/components/home/SignatureCare'
import ShopShowcase from '@/components/home/ShopShowcase'
import Testimonials from '@/components/home/Testimonials'
import ClientAssurance from '@/components/home/ClientAssurance'
import SupportBanner from '@/components/home/SupportBanner'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
// import ClientHeader from '@/widgets/header/ClientHeader'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Если пользователь авторизован и является администратором, перенаправляем на дашборд
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      router.push('/admin/dashboard')
    }
  }, [session, status, router])

  // Показываем загрузку пока проверяем сессию
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* <ClientHeader /> */}
      <main className="flex min-h-screen flex-col">
        <Hero />
        <Highlights />
        <ServiceWorkflow />
        <AtelierExperience />
        <SignatureCare />
        <ShopShowcase />
        <Testimonials />
        <ClientAssurance />
        <SupportBanner />
      </main>
    </>
  )
}
