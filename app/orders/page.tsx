'use client'

import { useEffect, useState } from 'react'
import { Plus, ShoppingBag, MessageCircle, ExternalLink } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Product { id: string; name: string; basePrice: number }
interface Customer { id: string; name: string; phone: string }
interface OrderItem { productId: string; quantity: number; price: number; product: { name: string } }
interface Order {
  id: string; transactionId: string; channel: string; totalAmount: number;
  status: string; createdAt: string; deliveryFee: number; notes?: string;
  customer: { name: string; phone: string; email?: string }
  items: OrderItem[]
}

const CHANNELS = ['tiktok', 'instagram', 'whatsapp']

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [lastWhatsapp, setLastWhatsapp] = useState<string | null>(null)

  const [form, setForm] = useState({
    customerId: '', channel: 'tiktok', deliveryFee: '0', notes: '',
    items: [{ productId: '', quantity: 1, price: 0 }],
  })

  useEffect(() => {
    fetchOrders()
    fetch('/api/products').then(r => r.json()).then(setProducts)
    fetch('/api/customers').then(r => r.json()).then(setCustomers)
  }, [])

  const fetchOrders = async () => {
    const res = await fetch('/api/orders')
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { productId: '', quantity: 1, price: 0 }] })
  }

  const removeItem = (i: number) => {
    setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })
  }

  const updateItem = (i: number, key: string, value: string | number) => {
    const items = [...form.items]
    if (key === 'productId') {
      const product = products.find(p => p.id === value)
      items[i] = { ...items[i], productId: String(value), price: product?.basePrice ?? 0 }
    } else {
      items[i] = { ...items[i], [key]: value }
    }
    setForm({ ...form, items })
  }

  const subtotal = form.items.reduce((s, i) => s + i.price * i.quantity, 0)
  const total = subtotal + parseFloat(form.deliveryFee || '0')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      setLastWhatsapp(data.whatsappLink)
      setShowForm(false)
      setForm({ customerId: '', channel: 'tiktok', deliveryFee: '0', notes: '', items: [{ productId: '', quantity: 1, price: 0 }] })
      fetchOrders()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl text-surface-900 mb-1">Orders</h2>
          <p className="text-surface-400 text-sm">{orders.length} orders total</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New Order
        </button>
      </div>

      {/* WhatsApp prompt after order creation */}
      {lastWhatsapp && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">Order created! Send confirmation to customer?</p>
            <p className="text-xs text-green-600 mt-0.5">Tap to open WhatsApp with pre-filled message</p>
          </div>
          <div className="flex gap-2 ml-4">
            <a
              href={lastWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>
            <button onClick={() => setLastWhatsapp(null)} className="text-green-600 text-sm px-3">Dismiss</button>
          </div>
        </div>
      )}

      {/* New order form */}
      {showForm && (
        <div className="bg-white border border-surface-200 rounded-xl p-6 mb-6">
          <h3 className="font-medium text-surface-900 mb-5">New Order</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-wide text-surface-400 mb-2">CUSTOMER</label>
                <select
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 bg-white"
                >
                  <option value="">Select customer...</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs tracking-wide text-surface-400 mb-2">CHANNEL</label>
                <select
                  value={form.channel}
                  onChange={(e) => setForm({ ...form, channel: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 bg-white capitalize"
                >
                  {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs tracking-wide text-surface-400">ITEMS</label>
                <button type="button" onClick={addItem} className="text-brand-500 text-xs hover:underline">+ Add item</button>
              </div>
              <div className="space-y-2">
                {form.items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(i, 'productId', e.target.value)}
                      required
                      className="flex-1 px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 bg-white"
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value))}
                      className="w-16 px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 text-center"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(i, 'price', parseFloat(e.target.value))}
                      className="w-24 px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400"
                      placeholder="Price"
                    />
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)} className="text-red-400 text-sm px-2 hover:text-red-600">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-wide text-surface-400 mb-2">DELIVERY FEE (QAR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.deliveryFee}
                  onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400"
                />
              </div>
              <div className="flex items-end pb-2.5">
                <div>
                  <p className="text-xs text-surface-400">TOTAL</p>
                  <p className="text-xl font-semibold text-surface-900">{formatCurrency(total)}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-wide text-surface-400 mb-2">NOTES</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Optional order notes..."
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium">
                Create Order
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-surface-500 px-4 py-2.5 text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Orders list */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-xl p-16 text-center">
          <ShoppingBag size={32} className="text-surface-300 mx-auto mb-4" />
          <p className="text-surface-400 text-sm">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-surface-200 rounded-xl p-5 cursor-pointer hover:border-brand-300 transition-colors"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-surface-900">{order.customer.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.channel === 'tiktok' ? 'bg-pink-50 text-pink-600' :
                      order.channel === 'instagram' ? 'bg-purple-50 text-purple-600' :
                      'bg-green-50 text-green-600'
                    }`}>{order.channel}</span>
                  </div>
                  <p className="text-xs text-surface-400 font-mono">{order.transactionId}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-surface-900">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-xs text-surface-400">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              {expanded === order.id && (
                <div className="mt-4 pt-4 border-t border-surface-100">
                  <div className="space-y-1 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-surface-700">{item.product.name} × {item.quantity}</span>
                        <span className="text-surface-500">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.deliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-surface-400">Delivery</span>
                        <span className="text-surface-500">{formatCurrency(order.deliveryFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-medium pt-2 border-t border-surface-100">
                      <span>Total</span>
                      <span className="text-brand-600">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                  {order.notes && <p className="text-xs text-surface-400 mb-3">Note: {order.notes}</p>}
                  <a
                    href={`https://wa.me/${order.customer.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 text-green-600 text-xs hover:underline"
                  >
                    <MessageCircle size={13} />
                    WhatsApp {order.customer.name}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
