'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// RadioGroup and Separator components will be implemented inline
import { CreditCard, Truck, MapPin, User } from 'lucide-react';
import useCustomToast from '@/hooks/useCustomToast';
import Spinner from '@/components/ui/spinner';
import { useCart } from '@/hooks/useCart';



interface CheckoutFormData {
  // Контактная информация
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Адрес доставки
  address: string;
  city: string;
  postalCode: string;
  country: string;
  
  // Способ доставки
  deliveryMethod: 'standard' | 'express' | 'pickup';
  
  // Способ оплаты
  paymentMethod: 'card' | 'cash' | 'online';
  
  // Комментарий к заказу
  comment?: string;
}

export default function Checkout() {
  const t = useTranslations('checkout');
  
  const deliveryOptions = [
    {
      id: 'standard',
      name: t('delivery.standard'),
      description: t('delivery.standardDesc'),
      price: 0,
      icon: Truck
    },
    {
      id: 'express',
      name: t('delivery.express'),
      description: t('delivery.expressDesc'),
      price: 500,
      icon: Truck
    },
    {
      id: 'pickup',
      name: t('delivery.pickup'),
      description: t('delivery.pickupDesc'),
      price: 0,
      icon: MapPin
    }
  ];

  const paymentOptions = [
    {
      id: 'card',
      name: t('payment.card'),
      description: t('payment.cardDesc'),
      icon: CreditCard
    },
    {
      id: 'cash',
      name: t('payment.cash'),
      description: t('payment.cashDesc'),
      icon: User
    },
    {
      id: 'online',
      name: t('payment.online'),
      description: t('payment.onlineDesc'),
      icon: CreditCard
    }
  ];
  const router = useRouter();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const { cartItems, loading, clearCart } = useCart();
  
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: t('form.defaultCountry'),
    deliveryMethod: 'standard',
    paymentMethod: 'card',
    comment: ''
  });
  
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});



  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = t('validation.firstNameRequired');
    if (!formData.lastName.trim()) newErrors.lastName = t('validation.lastNameRequired');
    if (!formData.email.trim()) newErrors.email = t('validation.emailRequired');
    if (!formData.phone.trim()) newErrors.phone = t('validation.phoneRequired');
    
    if (formData.deliveryMethod !== 'pickup') {
      if (!formData.address.trim()) newErrors.address = t('validation.addressRequired');
      if (!formData.city.trim()) newErrors.city = t('validation.cityRequired');
      if (!formData.postalCode.trim()) newErrors.postalCode = t('validation.postalCodeRequired');
    }
    
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid');
    }
    
    // Валидация телефона
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = t('validation.phoneInvalid');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка изменений в форме
  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очищаем ошибку для поля при изменении
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Подсчет стоимости
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.price * item.quantity),
    0
  );
  
  const selectedDelivery = deliveryOptions.find(option => option.id === formData.deliveryMethod);
  const deliveryPrice = selectedDelivery?.price || 0;
  const total = subtotal + deliveryPrice;

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  // Оформление заказа
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showErrorToast({
        title: t('validation.error'),
        description: t('validation.fillRequired')
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingAddress: formData.deliveryMethod !== 'pickup' ? {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        } : null,
        contactInfo: {
          email: formData.email,
          phone: formData.phone
        },
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        comment: formData.comment,
        totalAmount: total
      };
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        throw new Error(t('messages.orderError'));
      }
      
      const order = await response.json();
      
      showSuccessToast({
        title: t('messages.orderSuccess'),
        description: `${t('messages.orderNumber')}: ${order._id}`
      });
      
      // Очищаем корзину и перенаправляем на страницу заказа
      await clearCart();
      router.push(`/orders/${order._id}`);
      
    } catch (error) {
      console.error('Error creating order:', error);
      showErrorToast({
        title: t('messages.error'),
        description: t('messages.orderErrorDescription')
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Проверяем, что корзина не пуста
  if (!loading && cartItems.length === 0) {
    router.push('/cart');
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-gray-600 mt-2">{t('subtitle')}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Форма заказа */}
          <div className="lg:col-span-2 space-y-6">
            {/* Контактная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('personalInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t('firstName')} *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">{t('lastName')} *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">{t('email')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">{t('phone')} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Способ доставки */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  {t('deliveryMethod')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deliveryOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          value={option.id}
                          id={option.id}
                          name="deliveryMethod"
                          checked={formData.deliveryMethod === option.id}
                          onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <Icon className="h-5 w-5 text-gray-500" />
                        <div className="flex-1">
                          <Label htmlFor={option.id} className="font-medium cursor-pointer">
                            {option.name}
                          </Label>
                          <p className="text-sm text-gray-500">{option.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {option.price > 0 ? formatPrice(option.price) : t('free')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Адрес доставки */}
            {formData.deliveryMethod !== 'pickup' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t('deliveryInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">{t('address')} *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder={t('addressPlaceholder')}
                      className={errors.address ? 'border-red-500' : ''}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">{t('city')} *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="postalCode">{t('postalCode')} *</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className={errors.postalCode ? 'border-red-500' : ''}
                      />
                      {errors.postalCode && (
                        <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="country">{t('country')}</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        readOnly
                        disabled
                        className="bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Способ оплаты */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t('paymentMethod')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          value={option.id}
                          id={`payment-${option.id}`}
                          name="paymentMethod"
                          checked={formData.paymentMethod === option.id}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <Icon className="h-5 w-5 text-gray-500" />
                        <div className="flex-1">
                          <Label htmlFor={`payment-${option.id}`} className="font-medium cursor-pointer">
                            {option.name}
                          </Label>
                          <p className="text-sm text-gray-500">{option.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Комментарий к заказу */}
            <Card>
              <CardHeader>
                <CardTitle>{t('comment')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.comment}
                  onChange={(e) => handleInputChange('comment', e.target.value)}
                  placeholder={t('commentPlaceholder')}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Итоги заказа */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{t('yourOrder')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Список товаров */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={String(item.productId)} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-gray-500">{item.quantity} × {formatPrice(item.product.price)}</p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <hr className="border-gray-200" />
                
                {/* Расчет стоимости */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t('items')}:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>{t('delivery')}:</span>
                    <span>
                      {deliveryPrice > 0 ? formatPrice(deliveryPrice) : t('free')}
                    </span>
                  </div>
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('total')}:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting || cartItems.length === 0}
                >
                  {submitting ? (
                    <>
                      <Spinner />
                      {t('processing')}
                    </>
                  ) : (
                    t('placeOrder')
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/cart')}
                  className="w-full"
                  disabled={submitting}
                >
                  {t('backToCart')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}