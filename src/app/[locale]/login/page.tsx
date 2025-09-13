'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const t = useTranslations('login')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await signIn('credentials', { redirect: false, email, password })
    if (res?.error) {
      setError(t('invalidCredentials'))
    } else {
      router.push('/')
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md p-8 bg-white rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold text-center mb-6'>{t('title')}</h1>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Input 
              placeholder={t('email')} 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              type='email'
              required
            />
          </div>
          <div>
            <Input 
              type='password' 
              placeholder={t('password')} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className='text-red-500 text-sm text-center'>{error}</p>}
          <Button type='submit' className='w-full'>{t('signIn')}</Button>
          <div className='text-center'>
            <a href='#' className='text-sm text-blue-600 hover:underline'>
              {t('forgotPassword')}
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
