'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import BaseContainer from '@/components/BaseContainer'

export default function ProfilePage() {
  const t = useTranslations('profile')
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(session?.user?.name || '')
  const [email, setEmail] = useState(session?.user?.email || '')

  const handleSave = async () => {
    // TODO: Implement profile update logic
    setIsEditing(false)
  }

  const handleCancel = () => {
    setName(session?.user?.name || '')
    setEmail(session?.user?.email || '')
    setIsEditing(false)
  }

  if (!session) {
    return (
      <BaseContainer>
        <div className='flex items-center justify-center min-h-screen'>
          <p className='text-lg'>{t('notLoggedIn')}</p>
        </div>
      </BaseContainer>
    )
  }

  return (
    <BaseContainer>
      <div className='max-w-2xl mx-auto py-8'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-4'>
              <Avatar className='w-16 h-16'>
                <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                <AvatarFallback>{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className='text-2xl font-bold'>{t('title')}</h1>
                <p className='text-muted-foreground'>{t('subtitle')}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>{t('name')}</Label>
                {isEditing ? (
                  <Input
                    id='name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                  />
                ) : (
                  <p className='p-2 bg-gray-50 rounded border'>{session.user.name}</p>
                )}
              </div>
              
              <div className='space-y-2'>
                <Label htmlFor='email'>{t('email')}</Label>
                {isEditing ? (
                  <Input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                  />
                ) : (
                  <p className='p-2 bg-gray-50 rounded border'>{session.user.email}</p>
                )}
              </div>
              
              <div className='space-y-2'>
                <Label>{t('role')}</Label>
                <p className='p-2 bg-gray-50 rounded border capitalize'>
                  {t(`roles.${session.user.role}`)}
                </p>
              </div>
              
              <div className='space-y-2'>
                <Label>{t('memberSince')}</Label>
                <p className='p-2 bg-gray-50 rounded border'>
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className='flex gap-4 pt-4'>
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>{t('save')}</Button>
                  <Button variant='outline' onClick={handleCancel}>{t('cancel')}</Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>{t('edit')}</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseContainer>
  )
}