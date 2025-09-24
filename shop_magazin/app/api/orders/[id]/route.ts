import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Order from '@/models/Order';
import { getSession } from '@/auth';
import mongoose from 'mongoose';
import { OrderStatus, PaymentStatus } from '@/types';
import { getTranslations } from 'next-intl/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Получить заказ по ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
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
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: t('invalidOrderId') },
        { status: 400 }
      );
    }
    
    interface OrderFilter {
      _id: string;
      userId?: string;
    }
    
    const filter: OrderFilter = { _id: id };
    
    // Обычные пользователи могут видеть только свои заказы
    if (session.user.role !== 'admin') {
      filter.userId = session.user.id;
    }
    
    const order = await Order.findOne(filter).lean();
    
    if (!order) {
      return NextResponse.json(
        { error: t('orderNotFound') },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    const t = await getTranslations('api.errors');
    return NextResponse.json(
      { error: t('fetchingOrder') },
      { status: 500 }
    );
  }
}

// PUT - Обновить статус заказа (только для админов)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const t = await getTranslations('api.errors');
    const session = await getSession();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: t('accessDenied') },
        { status: 403 }
      );
    }
    
    await connectToDatabase();
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: t('invalidOrderId') },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { orderStatus, paymentStatus, notes } = body;
    
    const updateData: {
      orderStatus?: OrderStatus;
      paymentStatus?: PaymentStatus;
      notes?: string;
    } = {};
    
    if (orderStatus) {
      updateData.orderStatus = orderStatus;
    }
    
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();
    
    if (!order) {
      return NextResponse.json(
        { error: t('orderNotFound') },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    const t = await getTranslations('api.errors');
    return NextResponse.json(
      { error: t('updatingOrder') },
      { status: 500 }
    );
  }
}

// DELETE - Отменить заказ
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
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
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: t('invalidOrderId') },
        { status: 400 }
      );
    }
    
    interface CancelOrderFilter {
      _id: string;
      userId?: string;
    }
    
    const filter: CancelOrderFilter = { _id: id };
    
    // Обычные пользователи могут отменять только свои заказы
    if (session.user.role !== 'admin') {
      filter.userId = session.user.id;
    }
    
    const order = await Order.findOne(filter);
    
    if (!order) {
      return NextResponse.json(
        { error: t('orderNotFound') },
        { status: 404 }
      );
    }
    
    // Можно отменить только заказы в статусе pending или confirmed
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return NextResponse.json(
        { error: t('cannotCancelOrder') },
        { status: 400 }
      );
    }
    
    order.orderStatus = 'cancelled';
    await order.save();
    
    const tMessages = await getTranslations('api.messages');
    return NextResponse.json(
      { message: tMessages('orderCancelled') },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error cancelling order:', error);
    const t = await getTranslations('api.errors');
    return NextResponse.json(
      { error: t('cancellingOrder') },
      { status: 500 }
    );
  }
}