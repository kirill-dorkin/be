import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Order from '@/models/Order';
import Cart, { ICartItem } from '@/models/Cart';
import Product from '@/models/Product';
import { getSession } from '@/auth';
import { OrderStatus } from '@/types';
import { getTranslations } from 'next-intl/server';
import { optimizedDb } from '@/lib/optimizedDb';

// GET - Получить заказы пользователя
export async function GET(request: NextRequest) {
  try {
    const t = await getTranslations('api.errors');
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: t('unauthorized') },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as OrderStatus;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    
    interface OrderFilter {
      userId?: string;
      orderStatus?: OrderStatus;
    }
    
    const filter: OrderFilter = {};
    
    // Админы могут видеть все заказы, обычные пользователи - только свои
    if (session.user.role !== 'admin') {
      filter.userId = session.user.id;
    }
    
    // Фильтр по статусу
    if (status) {
      filter.orderStatus = status;
    }
    
    // Используем оптимизированный сервис с кэшированием
    const result = await optimizedDb.findWithPagination(
      Order,
      filter,
      {
        page,
        limit,
        sortBy,
        sortOrder
      }
    );
    
    return NextResponse.json({
      orders: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    const t = await getTranslations('api.errors');
    return NextResponse.json(
      { error: t('fetchingOrders') },
      { status: 500 }
    );
  }
}

// POST - Создать новый заказ
export async function POST(request: NextRequest) {
  try {
    const t = await getTranslations('api.errors');
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: t('unauthorized') },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const body = await request.json();
    const {
      shippingAddress,
      contactInfo,
      deliveryMethod,
      paymentMethod,
      comment
    } = body;
    
    // Валидация обязательных полей
    if (!contactInfo?.email || !contactInfo?.phone || !paymentMethod) {
      return NextResponse.json(
        { error: t('fillRequiredFields') },
        { status: 400 }
      );
    }
    
    // Валидация адреса доставки для доставки (не самовывоз)
    if (deliveryMethod !== 'pickup' && (!shippingAddress?.firstName || !shippingAddress?.address)) {
      return NextResponse.json(
        { error: t('fillDeliveryAddress') },
        { status: 400 }
      );
    }
    
    // Получаем корзину пользователя
    const cart = await Cart.findOne({ userId: session.user.id });
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: t('cartIsEmpty') },
        { status: 400 }
      );
    }
    
    // Проверяем наличие товаров на складе
    for (const item of cart.items as ICartItem[]) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return NextResponse.json(
          { error: t('productNotFound') },
          { status: 400 }
        );
      }
      
      if (!product.inStock || product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: t('insufficientStock') },
          { status: 400 }
        );
      }
    }
    
    // Создаем заказ
    const order = new Order({
      userId: session.user.id,
      items: cart.items.map((item: ICartItem) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      totalAmount: cart.totalAmount,
      shippingAddress: deliveryMethod === 'pickup' ? {
        fullName: contactInfo.email,
        address: 'Самовывоз',
        city: 'Самовывоз',
        postalCode: '00000',
        country: 'Россия',
        phone: contactInfo.phone
      } : {
        fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'Россия',
        phone: contactInfo.phone
      },
      paymentMethod,
      notes: comment
    });
    
    await order.save();
    
    // Уменьшаем количество товаров на складе
    for (const item of cart.items as ICartItem[]) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: { stockQuantity: -item.quantity },
          $set: { inStock: true } // Будет пересчитано в pre-save hook если нужно
        }
      );
    }
    
    // Очищаем корзину
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    const t = await getTranslations('api.errors');
    return NextResponse.json(
      { error: t('creatingOrder') },
      { status: 500 }
    );
  }
}