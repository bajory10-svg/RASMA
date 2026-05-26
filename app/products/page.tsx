'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Plus, Package, Pencil, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  name: string
  type: string
  description?: string
  basePrice: number
  imageUrl?: string
  variations: { id: string; name: string; sku: string }[]
  inventory?: { quantity: number; minAlert: number }
}

const PRODUCT_TYPES = ['stencil', 'henna', 'brush', 'other']

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const supabase = createClient()

  const [form, setForm] = useState({
    name: '', type: 'stencil', description: '', basePrice: '',
    imageUrl: '', initialStock: '0', minAlert: '5',
    variations: [] as { name: string; sku: string }[],
  })

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('products').upload(fileName, file)
    if (error) { setUploading(false); return null }
    const { data } = supabase.storage.from('products').getPublicUrl(fileName)
    setUploading(false)
    return data.publicUrl
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file)
    if (url) setForm({ ...form, imageUrl: url })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({ name: '', type: 'stencil', description: '', basePrice: '', imageUrl: '', initialStock: '0', minAlert: '5', variations: [] })
      setShowForm(false)
      fetchProducts()
    }
  }

  const addVariation = () => {
    setForm({ ...form, variations: [...form.variations, { name: '', sku: '' }] })
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl text-surface-900 mb-1">Products</h2>
          <p className="text-surface-400 text-sm">{products.length} products in your catalog</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Add product form */}
      {showForm && (
        <div className="bg-white border border-surface-200 rounded-xl p-6 mb-6">
          <h3 className="font-medium text-surface-900 mb-5">New Product</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-wide text-surface-400 mb-2">NAME</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Wrist Stencil Pack"
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wide text-surface-400 mb-2">TYPE</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 bg-white capitalize"
                >
                  {PRODUCT_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs tracking-wide text-surface-400 mb-2">PRICE (QAR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wide text-surface-400 mb-2">INITIAL STOCK</label>
                <input
                  type="number"
                  value={form.initialStock}
                  onChange={(e) => setForm({ ...form, initialStock: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-wide text-surface-400 mb-2">DESCRIPTION</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Optional description..."
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wide text-surface-400 mb-2">PRODUCT IMAGE</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-600 file:text-sm file:font-medium hover:file:bg-brand-100"
              />
              {uploading && <p className="text-xs text-surface-400 mt-1">Uploading...</p>}
              {form.imageUrl && (
                <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-surface-200">
                  <Image src={form.imageUrl} alt="Preview" width={80} height={80} className="object-cover w-full h-full" />
                </div>
              )}
            </div>

            {/* Variations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs tracking-wide text-surface-400">VARIATIONS (OPTIONAL)</label>
                <button type="button" onClick={addVariation} className="text-brand-500 text-xs hover:underline">+ Add variation</button>
              </div>
              {form.variations.map((v, i) => (
                <div key={i} className="flex gap-3 mb-2">
                  <input
                    placeholder="Name (e.g. Wrist)"
                    value={v.name}
                    onChange={(e) => {
                      const vars = [...form.variations]
                      vars[i].name = e.target.value
                      setForm({ ...form, variations: vars })
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400"
                  />
                  <input
                    placeholder="SKU (e.g. STN-WRIST-01)"
                    value={v.sku}
                    onChange={(e) => {
                      const vars = [...form.variations]
                      vars[i].sku = e.target.value
                      setForm({ ...form, variations: vars })
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                Save Product
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-surface-500 hover:text-surface-900 px-4 py-2.5 text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-xl p-16 text-center">
          <Package size={32} className="text-surface-300 mx-auto mb-4" />
          <p className="text-surface-400 text-sm">No products yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const stock = product.inventory?.quantity ?? 0
            const lowStock = stock <= (product.inventory?.minAlert ?? 5)
            return (
              <div key={product.id} className="bg-white border border-surface-200 rounded-xl overflow-hidden">
                {product.imageUrl ? (
                  <div className="h-40 overflow-hidden">
                    <Image src={product.imageUrl} alt={product.name} width={400} height={160} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-40 bg-surface-100 flex items-center justify-center">
                    <Package size={32} className="text-surface-300" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-surface-900 text-sm">{product.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${
                      lowStock ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
                    }`}>
                      {stock} in stock
                    </span>
                  </div>
                  <p className="text-xs text-surface-400 capitalize mb-2">{product.type}</p>
                  <p className="text-brand-600 font-semibold text-sm">QAR {product.basePrice.toFixed(2)}</p>

                  {product.variations.length > 0 && (
                    <button
                      onClick={() => setExpanded(expanded === product.id ? null : product.id)}
                      className="flex items-center gap-1 text-xs text-surface-400 mt-3 hover:text-surface-600"
                    >
                      {product.variations.length} variation{product.variations.length > 1 ? 's' : ''}
                      {expanded === product.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  )}
                  {expanded === product.id && (
                    <div className="mt-2 space-y-1">
                      {product.variations.map((v) => (
                        <div key={v.id} className="flex justify-between text-xs text-surface-500 bg-surface-50 px-3 py-1.5 rounded">
                          <span>{v.name}</span>
                          <span className="text-surface-400">{v.sku}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
