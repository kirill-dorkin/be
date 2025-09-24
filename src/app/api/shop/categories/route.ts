import { NextRequest, NextResponse } from 'next/server'
import { shopStore } from '@/shared/lib/shopStore'
import { ProductCategory } from '@/shared/types'

export async function GET() {
  const categories = shopStore.listCategories()
  return NextResponse.json({ success: true, data: categories })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload: Omit<ProductCategory, "_id"> = {
      name: body.name,
      slug: body.slug,
      description: body.description,
    }
    const created = shopStore.createCategory(payload)
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
  }
}

