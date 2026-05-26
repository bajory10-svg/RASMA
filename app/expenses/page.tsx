'use client'

import { useEffect, useState } from 'react'
import { Plus, Wallet, Trash2, Car, Package, Truck, Megaphone, Settings, HelpCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  paymentMethod: string
  vendor?: string
  loggedBy?: string
  createdAt: string
}

const CATEGORIES = [
  { value: 'transport', label: 'Transport / Uber', icon: Car },
  { value: 'supplier', label: 'Supplier / Stock', icon: Package },
  { value: 'delivery', label: 'Delivery Charges', icon: Truck },
  { value: 'marketing', label: 'Marketing / Ads', icon: Megaphone },
  { value: 'operations', label: 'Operations', icon: Settings },
  { value: 'other', label: 'Other', icon: HelpCircle },
]

const PAYMENT_METHODS = ['cash', 'transfer', 'card']

const QUICK_ADD = [
  { description: 'Uber ride', category: 'transport', paymentMethod: 'card' },
  { description: 'Delivery fee', category: 'delivery', paymentMethod: 'cash' },
  { description: 'Stock from Saudi', category: 'supplier', paymentMethod: 'transfer' },
  { description: 'Stock from China (Shein)', category: 'supplier', paymentMethod: 'card' },
  { description: 'Instagram ads', category: 'marketing', paymentMethod: 'card' },
  { description: 'TikTok ads', category: 'marketing', paymentMethod: 'card' },
]

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    category: 'transport', description: '', amount: '', paymentMethod: 'cash', vendor: '',
  })

  useEffect(() => { fetchExpenses() }, [])

  const fetchExpenses = async () => {
    const res = await fetch('/api/expenses')
    const data = await res.json()
    setExpenses(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ category: 'transport', description: '', amount: '', paymentMethod: 'cash', vendor: '' })
      fetchExpenses()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return
    await fetch('/api/expenses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchExpenses()
  }

  const handleQuickAdd = (qa: typeof QUICK_ADD[0]) => {
    setForm({ ...form, description: qa.description, category: qa.category, paymentMethod: qa.paymentMethod })
    setShowForm(true)
  }

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

  const byCategory = CATEGORIES.map((cat) => ({
    ...cat,
    total: expenses.filter((e) => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl text-surface-900 mb-1">Expenses</h2>
          <p className="text-surface-400 text-sm">Total: {formatCurrency(totalExpenses)}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Log Expense
        </button>
      </div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {byCategory.map(({ value, label, icon: Icon, total }) => (
            <div key={value} className="bg-white border border-surface-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={15} className="text-surface-400" />
                <p className="text-xs text-surface-400 truncate">{label}</p>
              </div>
              <p className="font-semibold text-surface-900 text-sm">{formatCurrency(total)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick add */}
      {!showForm && (
        <div className="mb-6">
          <p className="text-xs text-surface-400 tracking-wide mb-3">QUICK ADD</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ADD.map((qa) => (
              <button
                key={qa.description}
                onClick={() => handleQuickAdd(qa)}
                className="text-xs bg-white border border-surface-200 hover:border-brand-300 text-surface-600 hover:text-brand-600 px-3 py-2 rounded-lg transition-colors"
              >
                + {qa.description}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expense form */}
      {showForm && (
        <div className="bg-white border border-surface-200 rounded-xl p-6 mb-6">
          <h3 className="font-medium text-surface-900 mb-5">Log Expense</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-wide text-surface-400 mb-2">CATEGORY</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 bg-white"
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs tracking-wide text-surface-400 mb-2">AMOUNT (QAR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wide text-surface-400 mb-2">DESCRIPTION</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  placeholder="What was this for?"
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wide text-surface-400 mb-2">PAYMENT METHOD</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 bg-white capitalize"
                >
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs tracking-wide text-surface-400 mb-2">VENDOR (OPTIONAL)</label>
                <input
                  value={form.vendor}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                  placeholder="e.g. Careem, supplier name"
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-surface-500 px-4 py-2.5 text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses list */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-xl p-16 text-center">
          <Wallet size={32} className="text-surface-300 mx-auto mb-4" />
          <p className="text-surface-400 text-sm">No expenses logged yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
          {expenses.map((expense) => {
            const cat = CATEGORIES.find((c) => c.value === expense.category)
            const Icon = cat?.icon ?? HelpCircle
            return (
              <div key={expense.id} className="flex items-center gap-4 px-5 py-4 border-b border-surface-100 last:border-0">
                <div className="w-9 h-9 bg-surface-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-surface-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{expense.description}</p>
                  <p className="text-xs text-surface-400 capitalize">{cat?.label} · {expense.paymentMethod}{expense.vendor ? ` · ${expense.vendor}` : ''}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-500 text-sm">-{formatCurrency(expense.amount)}</p>
                  <p className="text-xs text-surface-400">{formatDate(expense.createdAt)}</p>
                </div>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="text-surface-300 hover:text-red-400 transition-colors ml-2 flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
