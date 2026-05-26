'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Archive } from 'lucide-react'

interface InventoryItem {
  id: string
  quantity: number
  minAlert: number
  product: { name: string; type: string; imageUrl?: string }
}

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ quantity: string; minAlert: string }>({ quantity: '', minAlert: '' })

  useEffect(() => { fetchInventory() }, [])

  const fetchInventory = async () => {
    const res = await fetch('/api/inventory')
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }

  const startEdit = (item: InventoryItem) => {
    setEditing(item.id)
    setEditValues({ quantity: String(item.quantity), minAlert: String(item.minAlert) })
  }

  const saveEdit = async (id: string) => {
    await fetch('/api/inventory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editValues }),
    })
    setEditing(null)
    fetchInventory()
  }

  const lowStock = items.filter((i) => i.quantity <= i.minAlert)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl text-surface-900 mb-1">Inventory</h2>
        <p className="text-surface-400 text-sm">{items.length} products tracked · {lowStock.length} low stock</p>
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-600" />
            <h3 className="text-sm font-medium text-amber-800">Low Stock Alert</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((item) => (
              <span key={item.id} className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">
                {item.product.name} — {item.quantity} left
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inventory table */}
      {items.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-xl p-16 text-center">
          <Archive size={32} className="text-surface-300 mx-auto mb-4" />
          <p className="text-surface-400 text-sm">No inventory to track yet. Add products first.</p>
        </div>
      ) : (
        <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-3 border-b border-surface-100 text-xs tracking-wide text-surface-400">
            <span>PRODUCT</span>
            <span>TYPE</span>
            <span className="text-center">STOCK</span>
            <span className="text-center">ALERT AT</span>
            <span></span>
          </div>

          {items.map((item) => {
            const isLow = item.quantity <= item.minAlert
            return (
              <div key={item.id} className="px-6 py-4 border-b border-surface-100 last:border-0">
                {editing === item.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="md:col-span-2">
                      <p className="font-medium text-surface-900 text-sm">{item.product.name}</p>
                    </div>
                    <div className="flex gap-3 md:col-span-2">
                      <div>
                        <label className="text-xs text-surface-400">QUANTITY</label>
                        <input
                          type="number"
                          value={editValues.quantity}
                          onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })}
                          className="block w-24 mt-1 px-3 py-1.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-surface-400">ALERT AT</label>
                        <input
                          type="number"
                          value={editValues.minAlert}
                          onChange={(e) => setEditValues({ ...editValues, minAlert: e.target.value })}
                          className="block w-24 mt-1 px-3 py-1.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(item.id)} className="bg-brand-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium">Save</button>
                      <button onClick={() => setEditing(null)} className="text-surface-400 px-3 py-1.5 text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                    <div className="col-span-2 md:col-span-1">
                      <p className="font-medium text-surface-900 text-sm">{item.product.name}</p>
                    </div>
                    <p className="text-surface-400 text-xs capitalize hidden md:block">{item.product.type}</p>
                    <div className="text-center">
                      <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${isLow ? 'text-red-500' : 'text-green-600'}`}>
                        {isLow ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                        {item.quantity}
                      </span>
                    </div>
                    <p className="text-surface-400 text-sm text-center hidden md:block">{item.minAlert}</p>
                    <div className="text-right">
                      <button onClick={() => startEdit(item)} className="text-brand-500 text-xs hover:underline">Update stock</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
