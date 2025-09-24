import { NextRequest, NextResponse } from 'next/server'
import { shopStore } from '@/shared/lib/shopStore'

export async function GET() {
  return NextResponse.json({ success: true, data: shopStore.listTags() })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const created = shopStore.createTag({ name: body.name, slug: body.slug })
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
  }
}

