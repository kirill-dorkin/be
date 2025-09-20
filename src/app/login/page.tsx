'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await signIn('credentials', { redirect: false, email, password })
    if (res?.error) {
      setError('Неверные данные для входа')
    } else {
      router.push('/')
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
