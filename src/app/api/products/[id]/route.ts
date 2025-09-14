import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Product from '@/models/Product';
import { getSession } from '@/auth';
import mongoose from 'mongoose';
import { getTranslations } from 'next-intl/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Получить товар по ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const t = await getTranslations('api.errors');
    await connectToDatabase();
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: t('invalidProductId') },
        { status: 400 }
      );
    }
    
    const product = await Product.findById(id).lean();
    
    if (!product) {
      return NextResponse.json(
        { error: t('productNotFound') },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    const t = await getTranslations('api.errors');
    return NextResponse.json(
      { error: t('fetchingProduct') },
      { status: 500 }
    );
  }
}

// PUT - Обновить товар (только для админов)
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
        { error: t('invalidProductId') },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const updateData = { ...body };
    
    // Автоматически обновляем inStock на основе stockQuantity
    if ('stockQuantity' in updateData) {
      updateData.inStock = updateData.stockQuantity > 0;
    }
    
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();
    
    if (!product) {
      return NextResponse.json(
        { error: t('productNotFound') },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      const tError = await getTranslations('api.errors');
      return NextResponse.json(
        { error: tError('skuAlreadyExists') },
        { status: 400 }
      );
    }
    
    const tError = await getTranslations('api.errors');
    return NextResponse.json(
      { error: tError('updatingProduct') },
      { status: 500 }
    );
  }
}

// DELETE - Удалить товар (только для админов)
export async function DELETE(
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
        { error: t('invalidProductId') },
        { status: 400 }
      );
    }
    
    const product = await Product.findByIdAndDelete(id).lean();
    
    if (!product) {
      return NextResponse.json(
        { error: t('productNotFound') },
        { status: 404 }
      );
    }
    
    const tMessages = await getTranslations('api.messages');
    return NextResponse.json(
      { message: tMessages('productDeleted') },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    const t = await getTranslations('api.errors');
    return NextResponse.json(
      { error: t('deletingProduct') },
      { status: 500 }
    );
  }
}