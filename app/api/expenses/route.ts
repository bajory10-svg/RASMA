import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const month = searchParams.get('month')

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (month) {
      const start = new Date(month + '-01')
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
      where.createdAt = { gte: start, lte: end }
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const expense = await prisma.expense.create({
      data: {
        ...body,
        amount: parseFloat(body.amount),
        loggedBy: user.email,
      },
    })
    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await request.json()
    await prisma.expense.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
