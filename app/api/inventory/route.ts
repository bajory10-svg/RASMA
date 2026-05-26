import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: { select: { name: true, type: true, imageUrl: true } },
      },
      orderBy: { quantity: 'asc' },
    })
    return NextResponse.json(inventory)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, quantity, minAlert } = await request.json()
    const updated = await prisma.inventory.update({
      where: { id },
      data: {
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        ...(minAlert !== undefined && { minAlert: parseInt(minAlert) }),
      },
      include: { product: { select: { name: true, type: true } } },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
  }
}
