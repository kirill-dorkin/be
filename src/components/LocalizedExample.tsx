'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LanguageSwitcher from './LanguageSwitcher';

// Пример компонента, демонстрирующий использование переводов
export default function LocalizedExample() {
  const t = useTranslations('common');
  const tAuth = useTranslations('auth');
  const tProducts = useTranslations('products');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок с переключателем языков */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{tProducts('title')}</h1>
        <LanguageSwitcher />
      </div>

      {/* Пример формы входа */}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{tAuth('login')}</CardTitle>
          <CardDescription>
            {t('messages.requiredField')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{tAuth('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={tAuth('email')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{tAuth('password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={tAuth('password')}
            />
          </div>
          <div className="flex gap-2">
            <Button className="flex-1">
              {tAuth('signIn')}
            </Button>
            <Button variant="outline">
              {t('buttons.cancel')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Пример карточки товара */}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{tProducts('product')}</CardTitle>
          <CardDescription>
            {tProducts('price')}: $999
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{tProducts('description')}: Lorem ipsum dolor sit amet...</p>
          <div className="flex gap-2">
            <Button className="flex-1">
              {tProducts('addToCart')}
            </Button>
            <Button variant="outline">
              {tProducts('addToFavorites')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Пример статусных сообщений */}
      <div className="space-y-2">
        <div className="p-3 bg-green-100 text-green-800 rounded">
          {t('status.success')}: {t('messages.operationSuccess')}
        </div>
        <div className="p-3 bg-red-100 text-red-800 rounded">
          {t('status.error')}: {t('messages.operationError')}
        </div>
        <div className="p-3 bg-yellow-100 text-yellow-800 rounded">
          {t('status.warning')}: {t('messages.invalidInput')}
        </div>
      </div>

      {/* Пример кнопок действий */}
      <div className="flex flex-wrap gap-2">
        <Button variant="default">{t('buttons.save')}</Button>
        <Button variant="outline">{t('buttons.edit')}</Button>
        <Button variant="destructive">{t('buttons.delete')}</Button>
        <Button variant="secondary">{t('buttons.cancel')}</Button>
        <Button variant="ghost">{t('buttons.back')}</Button>
      </div>
    </div>
  );
}