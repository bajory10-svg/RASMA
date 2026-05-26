import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''

    const customers = await prisma.customer.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { instagramHandle: { contains: search, mode: 'insensitive' } },
        ],
      } : undefined,
      include: {
        _count: { select: { orders: true } },
        orders: {
          select: { totalAmount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const enriched = customers.map((c) => ({
      ...c,
      totalSpent: c.orders.reduce((sum, o) => sum + o.totalAmount, 0),
    }))

    return NextResponse.json(enriched)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const customer = await prisma.customer.create({ data: body })
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
