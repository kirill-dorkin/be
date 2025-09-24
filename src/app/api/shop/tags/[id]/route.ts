import { NextRequest, NextResponse } from 'next/server'
import { shopStore } from '@/shared/lib/shopStore'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const updated = shopStore.updateTag(params.id, body)
    if (!updated) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: updated })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const ok = shopStore.deleteTag(params.id)
  return NextResponse.json({ success: ok })
}


