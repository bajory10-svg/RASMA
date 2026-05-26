import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variations: true,
        inventory: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, type, description, basePrice, imageUrl, variations, initialStock = 0, minAlert = 5 } = body

    const product = await prisma.product.create({
      data: {
        name,
        type,
        description,
        basePrice: parseFloat(basePrice),
        imageUrl,
        variations: variations?.length > 0 ? {
          create: variations.map((v: { name: string; sku: string; imageUrl?: string }) => ({
            name: v.name,
            sku: v.sku,
            imageUrl: v.imageUrl,
          })),
        } : undefined,
        inventory: {
          create: {
            quantity: parseInt(initialStock),
            minAlert: parseInt(minAlert),
          },
        },
      },
      include: { variations: true, inventory: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
