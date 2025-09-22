'use client'
import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { showToast } from "@/shared/lib/toast"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const res = await signIn('credentials', { redirect: false, email, password })
      if (res?.error) {
        setError('Неверные данные для входа')
        showToast.error('Неверные данные для входа')
      } else {
        showToast.success('Вход выполнен успешно')
        
        // Получаем сессию для проверки роли пользователя
        const session = await getSession()
        
        if (session?.user?.role === 'admin') {
          // Если есть callbackUrl и это админский роут, используем его
          if (callbackUrl && callbackUrl.startsWith('/admin')) {
            router.push(callbackUrl)
          } else {
            // Иначе перенаправляем на дашборд
            router.push('/admin/dashboard')
          }
        } else {
          // Для обычных пользователей используем callbackUrl или главную страницу
          router.push(callbackUrl || '/')
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при входе'
      setError(errorMessage)
      showToast.error(errorMessage)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <form onSubmit={handleSubmit} className='space-y-4 w-80'>
        <Input placeholder='Электронная почта' value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type='password' placeholder='Пароль' value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className='text-red-500 text-sm'>{error}</p>}
        <Button type='submit' className='w-full'>Войти</Button>
      </form>
    </div>
  )
}
