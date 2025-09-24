import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import BaseContainer from '@/components/BaseContainer';
import { connectToDatabase } from '@/lib/dbConnect';
import Order from '@/models/Order';
import { authOptions } from '@/auth';
import OrderList from '@/components/shop/OrderList';
import mongoose from 'mongoose';
import { getTranslations } from 'next-intl/server';

// Метаданные будут генерироваться динамически

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations('orders');
  
  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  await connectToDatabase();
  
  const orders = await Order.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const serializedOrders = orders.map((order) => ({
    ...order,
    _id: (order._id as mongoose.Types.ObjectId).toString(),
    userId: (order.userId as mongoose.Types.ObjectId).toString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));

  return (
    <BaseContainer className="py-8">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">{t('myOrders')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('orderHistoryDescription')}
          </p>
        </div>
        <OrderList orders={serializedOrders as unknown as Parameters<typeof OrderList>[0]['orders']} />
      </div>
    </BaseContainer>
  );
}