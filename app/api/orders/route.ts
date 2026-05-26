import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTransactionId } from '@/lib/utils'
import { sendOrderConfirmationEmail, generateWhatsAppMessage } from '@/lib/email'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: { select: { name: true, phone: true, email: true } },
        items: {
          include: { product: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { customerId, channel, items, deliveryFee = 0, notes } = body

    // Calculate total
    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0)
    const totalAmount = subtotal + parseFloat(deliveryFee)
    const transactionId = generateTransactionId()

    // Create order with items
    const order = await prisma.order.create({
      data: {
        customerId,
        channel,
        transactionId,
        totalAmount,
        deliveryFee: parseFloat(deliveryFee),
        notes,
        status: 'completed',
        items: {
          create: items.map((item: { productId: string; quantity: number; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        customer: true,
        items: { include: { product: { select: { name: true } } } },
      },
    })

    // Deduct from inventory
    for (const item of items) {
      await prisma.inventory.updateMany({
        where: { productId: item.productId },
        data: { quantity: { decrement: item.quantity } },
      })
    }

    // Send email if customer has email
    if (order.customer.email) {
      await sendOrderConfirmationEmail({
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        transactionId: order.transactionId,
        items: order.items.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: order.totalAmount,
        deliveryFee: order.deliveryFee,
        deliveryMethod: order.customer.deliveryMethod,
        deliveryAddress: order.customer.deliveryAddress ?? undefined,
        channel: order.channel,
        createdAt: new Date(order.createdAt).toLocaleDateString('en-QA'),
      })
    }

    // Generate WhatsApp link
    const whatsappMsg = generateWhatsAppMessage({
      customerName: order.customer.name,
      customerEmail: order.customer.email ?? '',
      transactionId: order.transactionId,
      items: order.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.price,
      })),
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
      deliveryMethod: order.customer.deliveryMethod,
      deliveryAddress: order.customer.deliveryAddress ?? undefined,
      channel: order.channel,
      createdAt: new Date(order.createdAt).toLocaleDateString('en-QA'),
    })

    const whatsappLink = `https://wa.me/${order.customer.phone}?text=${whatsappMsg}`

    return NextResponse.json({ ...order, whatsappLink }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
