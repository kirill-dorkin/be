'use client'
import Hero from '@/components/home/Hero'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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
    // <main className="min-h-screen flex items-center justify-center">
    //   <div className="text-center">
    //     <h1 className="text-4xl font-bold mb-4">Добро пожаловать в be.kg</h1>
    //     <p className="text-lg text-gray-600">Система управления бизнес-оборудованием</p>
    //     {!session && (
    //       <div className="mt-6">
    //         <a 
    //           href="/login" 
    //           className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
    //           tabIndex={0}
    //         >
    //           Войти в систему
    //         </a>
    //       </div>
    //     )}
    //   </div>
    // </main>

    <Hero />
  );
}
