'use client'

import { useEffect, useState } from 'react'
import { Users, Plus, Search, Instagram } from 'lucide-react'

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  instagramHandle?: string
  tiktokHandle?: string
  source: string
  deliveryMethod: string
  deliveryAddress?: string
  notes?: string
  _count: { orders: number }
  totalSpent: number
}

const SOURCES = ['tiktok', 'instagram', 'whatsapp', 'referral', 'word_of_mouth']

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Customer | null>(null)

  const [form, setForm] = useState({
    name: '', phone: '', email: '', instagramHandle: '', tiktokHandle: '',
    source: 'tiktok', deliveryMethod: 'delivery', deliveryAddress: '', notes: '',
  })

  useEffect(() => { fetchCustomers() }, [search])

  const fetchCustomers = async () => {
    const res = await fetch(`/api/customers?search=${search}`)
    const data = await res.json()
    setCustomers(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ name: '', phone: '', email: '', instagramHandle: '', tiktokHandle: '', source: 'tiktok', deliveryMethod: 'delivery', deliveryAddress: '', notes: '' })
      fetchCustomers()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl text-surface-900 mb-1">Customers</h2>
          <p className="text-surface-400 text-sm">{customers.length} customers</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or Instagram..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:border-brand-400 bg-white"
        />
      </div>

      {/* Add customer form */}
      {showForm && (
        <div className="bg-white border border-surface-200 rounded-xl p-6 mb-6">
          <h3 className="font-medium text-surface-900 mb-5">New Customer</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'FULL NAME', placeholder: 'Customer name', required: true },
                { key: 'phone', label: 'PHONE (with country code)', placeholder: '+974 XXXX XXXX', required: true },
                { key: 'email', label: 'EMAIL', placeholder: 'optional' },
                { key: 'instagramHandle', label: 'INSTAGRAM', placeholder: '@handle' },
                { key: 'tiktokHandle', label: 'TIKTOK', placeholder: '@handle' },
              ].map(({ key, label, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-xs tracking-wide text-surface-400 mb-2">{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={required}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs tracking-wide text-surface-400 mb-2">SOURCE</label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 bg-white capitalize"
                >
                  {SOURCES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs tracking-wide text-surface-400 mb-2">DELIVERY METHOD</label>
                <select
                  value={form.deliveryMethod}
                  onChange={(e) => setForm({ ...form, deliveryMethod: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 bg-white"
                >
                  <option value="delivery">Delivery</option>
                  <option value="pickup">Pickup</option>
                </select>
              </div>
            </div>

            {form.deliveryMethod === 'delivery' && (
              <div>
                <label className="block text-xs tracking-wide text-surface-400 mb-2">DELIVERY ADDRESS</label>
                <input
                  value={form.deliveryAddress}
                  onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                  placeholder="Address in Qatar"
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400"
                />
              </div>
            )}

            <div>
              <label className="block text-xs tracking-wide text-surface-400 mb-2">NOTES</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Any notes about this customer..."
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-surface-500 px-4 py-2.5 text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Customer list */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-xl p-16 text-center">
          <Users size={32} className="text-surface-300 mx-auto mb-4" />
          <p className="text-surface-400 text-sm">No customers yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white border border-surface-200 rounded-xl p-5 cursor-pointer hover:border-brand-300 transition-colors"
              onClick={() => setSelected(selected?.id === customer.id ? null : customer)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-surface-900">{customer.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      customer.source === 'tiktok' ? 'bg-pink-50 text-pink-600' :
                      customer.source === 'instagram' ? 'bg-purple-50 text-purple-600' :
                      'bg-surface-100 text-surface-500'
                    }`}>
                      {customer.source.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-surface-500">{customer.phone}</p>
                  {customer.instagramHandle && (
                    <p className="text-xs text-surface-400 mt-0.5">IG: {customer.instagramHandle}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium text-surface-900">QAR {customer.totalSpent.toFixed(2)}</p>
                  <p className="text-xs text-surface-400">{customer._count.orders} order{customer._count.orders !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {selected?.id === customer.id && (
                <div className="mt-4 pt-4 border-t border-surface-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  {customer.email && (
                    <div>
                      <p className="text-xs text-surface-400 mb-1">EMAIL</p>
                      <p className="text-surface-700">{customer.email}</p>
                    </div>
                  )}
                  {customer.tiktokHandle && (
                    <div>
                      <p className="text-xs text-surface-400 mb-1">TIKTOK</p>
                      <p className="text-surface-700">{customer.tiktokHandle}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-surface-400 mb-1">DELIVERY</p>
                    <p className="text-surface-700 capitalize">{customer.deliveryMethod}</p>
                    {customer.deliveryAddress && <p className="text-xs text-surface-400 mt-0.5">{customer.deliveryAddress}</p>}
                  </div>
                  {customer.notes && (
                    <div className="md:col-span-3">
                      <p className="text-xs text-surface-400 mb-1">NOTES</p>
                      <p className="text-surface-600">{customer.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
