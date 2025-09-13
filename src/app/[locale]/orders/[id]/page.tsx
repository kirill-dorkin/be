import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BaseContainer from '@/components/BaseContainer';
import { connectToDatabase } from '@/lib/dbConnect';
import Order, { IOrder, IOrderItem } from '@/models/Order';
import Product, { IProduct } from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import OrderDetails from '@/components/shop/OrderDetails';
import mongoose from 'mongoose';

interface OrderPageProps {
  params: {
    id: string;
  };
}

interface OrderItemWithProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  product: IProduct | null;
}

interface OrderWithProducts extends Omit<IOrder, 'items'> {
  items: OrderItemWithProduct[];
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  return {
    title: `Заказ #${params.id} - Интернет-магазин`,
    description: 'Детали заказа и статус доставки'
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    notFound();
  }

  try {
    await connectToDatabase();
    
    // Находим заказ
    const order = await Order.findById(params.id).lean() as (IOrder & { _id: mongoose.Types.ObjectId }) | null;
    
    if (!order) {
      notFound();
    }
    
    // Проверяем права доступа (пользователь может видеть только свои заказы, админ - все)
    if (order.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      notFound();
    }
    
    // Получаем информацию о товарах
    const productIds = order.items.map((item: IOrderItem) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean().exec() as unknown as (IProduct & { _id: mongoose.Types.ObjectId })[];
    
    // Объединяем данные заказа с информацией о товарах
    const orderWithProducts = {
      ...order,
      items: order.items.map((item: IOrderItem) => {
        const product = products.find(p => p._id.toString() === item.productId.toString());
        return {
          productId: item.productId.toString(),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          product: product ? {
            ...product,
            _id: product._id.toString(),
            category: product.category.toString()
          } as IProduct : null
        };
      })
    } as OrderWithProducts;
    
    return (
      <BaseContainer>
        <div className="py-8">
          <OrderDetails order={orderWithProducts} />
        </div>
      </BaseContainer>
    );
  } catch (error) {
    console.error('Error fetching order:', error);
    notFound();
  }
}