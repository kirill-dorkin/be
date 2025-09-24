import { NextRequest, NextResponse } from 'next/server'
import { shopStore } from '@/shared/lib/shopStore'
import { Order } from '@/shared/types'

export async function GET() {
  const orders = shopStore.listOrders()
  return NextResponse.json({ success: true, data: orders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload: Omit<Order, "_id" | "createdAt" | "updatedAt" | "status"> & { status?: Order['status'] } = {
      userId: body.userId,
      items: body.items,
      total: body.total,
      currency: body.currency ?? 'RUB',
      address: body.address,
      status: body.status,
    }
    const created = shopStore.createOrder(payload)
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
  }
}

