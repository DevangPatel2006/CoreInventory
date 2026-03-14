import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeftRight, Search, Plus, Trash2, Check, AlertCircle, Save, X } from "lucide-react"
import { productsApi, warehousesApi, transfersApi } from "../lib/api"

export default function Transfers() {
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    notes: "",
    from_location: "",
    to_location: "",
    moves: [] // { product_id, qty }
  })
  const [submitting, setSubmitting] = useState(false)
  
  const fetchAll = async () => {
    setLoading(true)
    try {
      const [pRes, wRes, tRes] = await Promise.all([
        productsApi.list(), 
        warehousesApi.list(),
        transfersApi.list()
      ])
      setProducts(pRes)
      setWarehouses(wRes)
      setTransfers(tRes)
    } catch (err) {
      setError("Failed to load initial data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      moves: [...prev.moves, { product_id: "", qty: "" }]
    }))
  }

  const removeLine = (index) => {
    setFormData(prev => ({
      ...prev,
      moves: prev.moves.filter((_, i) => i !== index)
    }))
  }

  const updateLine = (index, field, value) => {
    setFormData(prev => {
      const newMoves = [...prev.moves]
      newMoves[index] = { ...newMoves[index], [field]: value }
      return { ...prev, moves: newMoves }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.from_location || !formData.to_location) return setError("Select source and destination warehouses")
    if (formData.from_location === formData.to_location) return setError("Source and destination must be different")
    
    const validMoves = formData.moves.filter(m => m.product_id && Number(m.qty) > 0).map(m => ({
      ...m,
      product_id: parseInt(m.product_id),
      qty: parseFloat(m.qty),
      from_location: parseInt(formData.from_location),
      to_location: parseInt(formData.to_location)
    }))

    if (validMoves.length === 0) return setError("Add at least one valid product to transfer")

    setSubmitting(true)
    setError(null)
    
    try {
      await transfersApi.create({
        notes: formData.notes,
        moves: validMoves,
        validate_immediately: true
      })
      setIsFormOpen(false)
      setFormData({ notes: "", from_location: "", to_location: "", moves: [] })
      await fetchAll()
    } catch (err) {
      setError(err.message || "Transfer failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (warehouses.length < 2 && !loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col justify-center items-center h-64 border-2 border-dashed rounded-xl border-muted bg-muted/20 text-center">
           <ArrowLeftRight className="h-10 w-10 text-muted-foreground mb-4" />
           <h2 className="text-xl font-semibold">Warehouse Transfers Disabled</h2>
           <p className="text-muted-foreground mt-2 max-w-sm">
             You need at least two warehouses configured to make a transfer.
           </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
         <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Internal Transfers</h1>
            <p className="text-muted-foreground font-medium text-lg italic">Move stock intelligently between locations</p>
         </div>
         <button 
           onClick={() => {
             setIsFormOpen(true)
             if (formData.moves.length === 0) addLine()
           }} 
           className="btn-primary flex items-center space-x-2"
         >
            <ArrowLeftRight className="h-5 w-5" />
            <span>NEW TRANSFER</span>
         </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center space-x-2 font-bold text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {isFormOpen ? (
        <div className="antigravity-card p-8 relative">
          <button 
            onClick={() => setIsFormOpen(false)} 
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 text-muted-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Create Transfer Operation</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source Warehouse *</label>
                <select 
                  className="input-premium w-full h-12 font-bold bg-white"
                  value={formData.from_location}
                  onChange={e => setFormData({...formData, from_location: e.target.value})}
                  required
                >
                  <option value="">Select source...</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Destination Warehouse *</label>
                <select 
                  className="input-premium w-full h-12 font-bold bg-white"
                  value={formData.to_location}
                  onChange={e => setFormData({...formData, to_location: e.target.value})}
                  required
                >
                  <option value="">Select destination...</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black uppercase">Products to Move</h3>
                <button type="button" onClick={addLine} className="text-primary text-xs font-black flex items-center hover:underline">
                  <Plus className="h-4 w-4 mr-1" /> Add Line
                </button>
              </div>
              
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-1/4">Quantity</th>
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {formData.moves.map((line, idx) => (
                      <tr key={idx}>
                        <td className="p-2">
                          <select 
                            className="input-premium w-full h-10 text-sm font-bold bg-transparent border-transparent hover:border-gray-200"
                            value={line.product_id}
                            onChange={e => updateLine(idx, "product_id", e.target.value)}
                            required
                          >
                            <option value="">Select product...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                          </select>
                        </td>
                        <td className="p-2">
                          <input 
                            type="number" 
                            step="0.01" 
                            min="0.01"
                            className="input-premium w-full h-10 text-sm font-bold bg-transparent border-transparent hover:border-gray-200"
                            value={line.qty}
                            onChange={e => updateLine(idx, "qty", e.target.value)}
                            placeholder="Qty"
                            required
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button type="button" onClick={() => removeLine(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {formData.moves.length === 0 && (
                  <div className="p-8 text-center text-sm text-muted-foreground italic bg-gray-50">
                    No products added. Click "Add Line" to start.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notes / Reason</label>
              <input 
                className="input-premium w-full h-12 font-bold"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="e.g. Rebalancing stock for Q3..."
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button disabled={submitting} type="submit" className="btn-primary flex items-center space-x-2 px-8">
                <Save className="h-5 w-5" />
                <span>{submitting ? "VALIDATING..." : "VALIDATE TRANSFER"}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="antigravity-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/30">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Reference</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Date</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Items</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transfers.length > 0 ? transfers.map((t) => (
                <tr key={t.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">{t.ref_number}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-sm">
                    {t.moves.length} line(s)
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-black text-[10px] uppercase tracking-widest rounded-full">
                      {t.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground italic font-medium">
                    No transfers found. Create one manually to move stock between warehouses.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

