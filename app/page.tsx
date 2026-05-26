import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Users, ShoppingBag, AlertTriangle, Package, Wallet } from 'lucide-react'

async function getStats() {
  console.log('getStats: Starting database queries...')
  try {
    const [
      ordersCount,
      revenueResult,
      customersCount,
      lowStockCount,
      expensesResult,
      recentOrders,
      recentExpenses,
    ] = await Promise.all([
      prisma.order.count({ where: { status: 'completed' } }),
      prisma.order.aggregate({ where: { status: 'completed' }, _sum: { totalAmount: true } }),
      prisma.customer.count(),
      prisma.inventory.count({ where: { quantity: { lte: 5 } } }),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true } } },
      }),
      prisma.expense.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const revenue = revenueResult._sum.totalAmount ?? 0
    const expenses = expensesResult._sum.amount ?? 0

    console.log('getStats: All queries completed successfully.')
    return { ordersCount, revenue, customersCount, lowStockCount, expenses, profit: revenue - expenses, recentOrders, recentExpenses }
  } catch (error) {
    console.error('getStats: Error executing database queries:', error)
    throw error;
  }
}

export default async function Dashboard() {
  const stats = await getStats()

  const cards = [
    { label: 'Total Revenue', value: formatCurrency(stats.revenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Expenses', value: formatCurrency(stats.expenses), icon: Wallet, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Net Profit', value: formatCurrency(stats.profit), icon: TrendingUp, color: stats.profit >= 0 ? 'text-brand-600' : 'text-red-600', bg: stats.profit >= 0 ? 'bg-brand-50' : 'bg-red-50' },
    { label: 'Total Orders', value: stats.ordersCount, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Customers', value: stats.customersCount, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Low Stock Items', value: stats.lowStockCount, icon: AlertTriangle, color: stats.lowStockCount > 0 ? 'text-amber-600' : 'text-green-600', bg: stats.lowStockCount > 0 ? 'bg-amber-50' : 'bg-green-50' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl text-surface-900 mb-1">Overview</h2>
        <p className="text-surface-400 text-sm">Welcome back. Here's how your business is doing.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-surface-200 p-5">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-surface-400 text-xs tracking-wide mb-1">{label.toUpperCase()}</p>
            <p className="text-surface-900 text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-medium text-surface-900">Recent Orders</h3>
            <a href="/orders" className="text-brand-500 text-xs hover:underline">View all</a>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-surface-400 text-sm py-4 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-surface-900">{order.customer.name}</p>
                    <p className="text-xs text-surface-400">{order.transactionId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-surface-900">{formatCurrency(order.totalAmount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.channel === 'tiktok' ? 'bg-pink-50 text-pink-600' : order.channel === 'instagram' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
                      {order.channel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent expenses */}
        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-medium text-surface-900">Recent Expenses</h3>
            <a href="/expenses" className="text-brand-500 text-xs hover:underline">View all</a>
          </div>
          {stats.recentExpenses.length === 0 ? (
            <p className="text-surface-400 text-sm py-4 text-center">No expenses yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-surface-900">{expense.description}</p>
                    <p className="text-xs text-surface-400 capitalize">{expense.category} · {expense.paymentMethod}</p>
                  </div>
                  <p className="text-sm font-medium text-red-500">-{formatCurrency(expense.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
