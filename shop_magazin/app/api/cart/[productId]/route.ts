import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Cart, { ICartItem } from '@/models/Cart';
import { getSession } from '@/auth';
import mongoose from 'mongoose';
import { getTranslations } from 'next-intl/server';

interface RouteParams {
  params: Promise<{ productId: string }>;
}

// DELETE - Удалить товар из корзины
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const t = await getTranslations('api.errors');
    const tMessages = await getTranslations('api.messages');
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: t('unauthorized') },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const { productId } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: t('invalidProductId') },
        { status: 400 }
      );
    }
    
    const cart = await Cart.findOne({ userId: session.user.id });
    
    if (!cart) {
      return NextResponse.json(
        { error: t('cartNotFound') },
        { status: 404 }
      );
    }
    
    const itemIndex = cart.items.findIndex(
      (item: ICartItem) => item.productId.toString() === productId
    );
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: t('itemNotFoundInCart') },
        { status: 404 }
      );
    }
    
    cart.items.splice(itemIndex, 1);
    await cart.save();
    
    return NextResponse.json(
      { message: tMessages('itemRemovedFromCart') },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing item from cart:', error);
    const t = await getTranslations('api.errors');
    return NextResponse.json(
      { error: t('removingFromCart') },
      { status: 500 }
    );
  }
}