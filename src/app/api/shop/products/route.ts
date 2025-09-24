import { NextRequest, NextResponse } from 'next/server'
import { shopStore } from '@/shared/lib/shopStore'
import { Product } from '@/shared/types'

export async function GET() {
  const products = shopStore.listProducts().filter(p => p.isActive)
  return NextResponse.json({ success: true, data: products })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload: Omit<Product, "_id" | "createdAt" | "updatedAt"> = {
      title: body.title,
      slug: body.slug,
      description: body.description,
      price: body.price,
      currency: body.currency ?? 'RUB',
      images: Array.isArray(body.images) ? body.images : [],
      categoryId: body.categoryId,
      stock: body.stock ?? 0,
      isActive: body.isActive ?? true,
    }
    const created = shopStore.createProduct(payload)
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
  }
}

