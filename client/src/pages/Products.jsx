import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Filter, Package, AlertTriangle, TrendingUp, Edit3, Save, X, MoreVertical, Archive, RefreshCw } from "lucide-react"
import { productsApi, categoriesApi, warehousesApi } from "../lib/api"

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: "", sku: "", category_id: "", unit_of_measure: "pcs", min_stock_level: 10 })

  const fetchAll = async () => {
    setLoading(true)
    setError("")
    try {
      const [prods, cats, whs] = await Promise.all([
        productsApi.list(searchTerm ? { search: searchTerm } : {}),
        categoriesApi.list(),
        warehousesApi.list(),
      ])
      setProducts(prods)
      setCategories(cats)
      setWarehouses(whs)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    const timer = setTimeout(() => { if (!loading) fetchAll() }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const totalStock = products.reduce((acc, p) => acc + p.stock_locations.reduce((s, l) => s + Number(l.quantity), 0), 0)
  const understockCount = products.filter(p => p.stock_locations.some(l => Number(l.quantity) < Number(p.min_stock_level))).length

  const handleSaveEdit = async (product) => {
    // Inline stock edit triggers an adjustment — for now just reflect locally until DB integration
    setProducts(products.map(p => p.id === product.id ? { ...p, stock_locations: p.stock_locations.map((l, i) => i === 0 ? { ...l, quantity: editValue } : l) } : p))
    setEditingId(null)
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.sku) return setFormError("Name and SKU are required")
    if (!newProduct.category_id) return setFormError("Select a category")
    setSubmitting(true)
    setFormError("")
    try {
      await productsApi.create(newProduct)
      setIsModalOpen(false)
      setNewProduct({ name: "", sku: "", category_id: "", unit_of_measure: "pcs", min_stock_level: 10 })
      await fetchAll()
    } catch (e) { setFormError(e.message) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Products & Stock</h1>
          <p className="text-muted-foreground font-medium text-lg italic">Master product catalog and inventory levels</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchAll} className="h-12 px-4 rounded-xl border border-white/20 bg-white/50 hover:bg-white text-muted-foreground transition-all">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center space-x-2">
            <Plus className="h-5 w-5" /><span>ADD PRODUCT</span>
          </button>
        </div>
      </div>

      {error && <div className="px-6 py-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold text-sm">⚠ {error}</div>}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="antigravity-card p-8 flex items-center space-x-5">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Package className="h-7 w-7 text-primary" /></div>
          <div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Stock</p><p className="text-3xl font-black">{loading ? "—" : totalStock.toLocaleString()}</p></div>
        </div>
        <div className="antigravity-card p-8 flex items-center space-x-5">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0"><AlertTriangle className="h-7 w-7 text-amber-500" /></div>
          <div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Understock Items</p><p className="text-3xl font-black">{loading ? "—" : understockCount}</p></div>
        </div>
        <div className="antigravity-card p-8 flex items-center space-x-5">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0"><TrendingUp className="h-7 w-7 text-emerald-600" /></div>
          <div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Products</p><p className="text-3xl font-black">{loading ? "—" : products.length}</p></div>
        </div>
      </div>

      <div className="glass p-4 rounded-2xl flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input type="text" placeholder="Search products by name or SKU..." className="input-premium pl-12 w-full h-12"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="antigravity-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted/40 animate-pulse rounded-xl" />)}</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/30">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">SKU / Category</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Stock</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Min Level</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => {
                const totalQty = p.stock_locations.reduce((s, l) => s + Number(l.quantity), 0)
                const isLow = totalQty < Number(p.min_stock_level)
                return (
                  <tr key={p.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-muted-foreground"><Archive className="h-6 w-6" /></div>
                        <div>
                          <div className="font-bold text-foreground text-lg">{p.name}</div>
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">{p.id.slice(0, 8)}…</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-primary font-mono text-sm">{p.sku}</div>
                      <div className="text-xs font-black text-muted-foreground uppercase mt-1 tracking-wider">{p.category?.name}</div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {editingId === p.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <input type="number" autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)}
                            className="w-24 h-10 text-right bg-white border border-primary/30 rounded-lg pr-3 font-black text-primary outline-none" />
                          <button onClick={() => handleSaveEdit(p)} className="p-2 bg-primary text-white rounded-lg"><Save className="h-4 w-4" /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 bg-gray-100 rounded-lg"><X className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <div onClick={() => { setEditingId(p.id); setEditValue(totalQty) }}
                          className={`flex items-center justify-end space-x-2 cursor-pointer p-2 rounded-xl hover:bg-white transition-all ${isLow ? "text-destructive" : "text-foreground"}`}>
                          <span className="text-xl font-black">{totalQty}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{p.unit_of_measure}</span>
                          <Edit3 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right font-black text-muted-foreground">{Number(p.min_stock_level)}</td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-white rounded-lg text-muted-foreground"><MoreVertical className="h-5 w-5" /></button>
                    </td>
                  </tr>
                )
              })}
              {!products.length && (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-muted-foreground italic font-medium">No products found. Add your first product to get started.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl antigravity-card p-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-foreground tracking-tight">Add New Product</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all"><X className="h-6 w-6 text-muted-foreground" /></button>
              </div>
              {formError && <div className="mb-6 px-5 py-3 rounded-xl bg-destructive/10 text-destructive font-bold text-sm">{formError}</div>}
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Product Name</label>
                  <input required value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Wireless Mouse" className="input-premium w-full h-14 text-lg font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">SKU</label>
                    <input required value={newProduct.sku} onChange={e => setNewProduct(p => ({ ...p, sku: e.target.value }))}
                      placeholder="SKU-001" className="input-premium w-full h-12 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Category</label>
                    <select value={newProduct.category_id} onChange={e => setNewProduct(p => ({ ...p, category_id: e.target.value }))}
                      className="input-premium w-full h-12 font-bold appearance-none">
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Unit of Measure</label>
                    <input value={newProduct.unit_of_measure} onChange={e => setNewProduct(p => ({ ...p, unit_of_measure: e.target.value }))}
                      placeholder="pcs" className="input-premium w-full h-12 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Min Stock Level</label>
                    <input type="number" value={newProduct.min_stock_level} onChange={e => setNewProduct(p => ({ ...p, min_stock_level: e.target.value }))}
                      className="input-premium w-full h-12 font-bold" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end space-x-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 h-14 rounded-2xl font-black text-muted-foreground uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary h-14 px-10">
                    {submitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : "CREATE PRODUCT"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
