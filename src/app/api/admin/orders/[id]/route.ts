import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

// GET - Получить конкретный заказ
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const order = await Order.findById(params.id)
      .populate({
        path: 'userId',
        model: User,
        select: 'name email phone'
      })
      .populate({
        path: 'items.productId',
        model: Product,
        select: 'name price images description'
      })
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Обновить заказ
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      status,
      shippingAddress,
      paymentMethod,
      notes,
      trackingNumber,
      items
    } = body;

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Валидация статуса
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Обновление полей
    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: session.user.id
    };

    if (status) {
      updateData.status = status;
      
      // Автоматическое добавление временных меток для статусов
      if (status === 'processing' && !order.processedAt) {
        updateData.processedAt = new Date();
      } else if (status === 'shipped' && !order.shippedAt) {
        updateData.shippedAt = new Date();
      } else if (status === 'delivered' && !order.deliveredAt) {
        updateData.deliveredAt = new Date();
      } else if (status === 'cancelled' && !order.cancelledAt) {
        updateData.cancelledAt = new Date();
      }
    }

    if (shippingAddress) updateData.shippingAddress = shippingAddress;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (notes !== undefined) updateData.notes = notes;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    // Обновление товаров (только если заказ еще не обработан)
    if (items && order.status === 'pending') {
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return NextResponse.json(
            { error: `Product ${item.productId} not found` },
            { status: 404 }
          );
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        validatedItems.push({
          productId: product._id,
          quantity: item.quantity,
          price: product.price,
          total: itemTotal
        });
      }

      updateData.items = validatedItems;
      updateData.totalAmount = totalAmount;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate({
        path: 'userId',
        model: User,
        select: 'name email phone'
      })
      .populate({
        path: 'items.productId',
        model: Product,
        select: 'name price images'
      });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить заказ (только для отмененных заказов)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Можно удалять только отмененные заказы или заказы в статусе pending
    if (!['cancelled', 'pending'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Can only delete cancelled or pending orders' },
        { status: 400 }
      );
    }

    await Order.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}