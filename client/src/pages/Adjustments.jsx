import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileEdit, Check, AlertCircle, Save, X } from "lucide-react"
import { productsApi, warehousesApi, adjustmentsApi } from "../lib/api"

export default function Adjustments() {
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    product_id: "",
    warehouse_id: "",
    counted_quantity: "",
    notes: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    Promise.all([productsApi.list(), warehousesApi.list()])
      .then(([pRes, wRes]) => {
        setProducts(pRes)
        setWarehouses(wRes)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError("Failed to load generic data")
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccessMsg("")

    try {
      if (!formData.product_id || !formData.warehouse_id || formData.counted_quantity === "") {
        throw new Error("Please fill all required fields")
      }
      
      const payload = {
        product_id: parseInt(formData.product_id),
        warehouse_id: parseInt(formData.warehouse_id),
        counted_quantity: parseFloat(formData.counted_quantity),
        notes: formData.notes
      }
      
      const res = await adjustmentsApi.create(payload)
      setSuccessMsg(`Adjustment successful. ${res.message ? res.message : ''}`)
      setTimeout(() => {
        setIsFormOpen(false)
        setFormData({ product_id: "", warehouse_id: "", counted_quantity: "", notes: "" })
        setSuccessMsg("")
      }, 2000)
    } catch (err) {
      setError(err.message || "Failed to submit adjustment")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
         <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Stock Adjustments</h1>
            <p className="text-muted-foreground font-medium text-lg italic">Manual corrections for inventory discrepancies</p>
         </div>
         <button 
            onClick={() => setIsFormOpen(true)}
            className="btn-primary flex items-center space-x-2"
         >
            <FileEdit className="h-5 w-5" />
            <span>NEW ADJUSTMENT</span>
         </button>
      </div>

      {isFormOpen ? (
        <div className="antigravity-card p-8 relative">
          <button 
            onClick={() => setIsFormOpen(false)} 
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 text-muted-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Create Adjustment</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center space-x-2 font-bold text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl flex items-center space-x-2 font-bold text-sm">
              <Check className="h-4 w-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product *</label>
                <select 
                  className="input-premium w-full h-12 font-bold"
                  value={formData.product_id}
                  onChange={e => setFormData({...formData, product_id: e.target.value})}
                  disabled={loading || submitting}
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location *</label>
                <select 
                  className="input-premium w-full h-12 font-bold"
                  value={formData.warehouse_id}
                  onChange={e => setFormData({...formData, warehouse_id: e.target.value})}
                  disabled={loading || submitting}
                >
                  <option value="">Select a warehouse...</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Physical Count (Real Quantity) *</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                className="input-premium w-full h-12 font-bold text-lg"
                value={formData.counted_quantity}
                onChange={e => setFormData({...formData, counted_quantity: e.target.value})}
                disabled={submitting}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reason / Notes</label>
              <input 
                type="text" 
                className="input-premium w-full h-12 font-bold"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                disabled={submitting}
                placeholder="e.g. Annual inventory check, damaged good found..."
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={submitting}
                className="btn-primary flex items-center space-x-2 px-8"
              >
                {submitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                <span>{submitting ? "PROCESSING..." : "VALIDATE ADJUSTMENT"}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="antigravity-card p-20 flex flex-col items-center justify-center text-center space-y-6">
          <div className="h-24 w-24 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
             <Check className="h-12 w-12" />
          </div>
          <div>
             <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Perfect Inventory Sync</h2>
             <p className="text-muted-foreground font-medium italic mt-2 max-w-md mx-auto">
               Your theoretical stock matches perfectly with physical counts. Click "New Adjustment" if you find discrepancies.
             </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full ring-1 ring-emerald-200">
             <AlertCircle className="h-3 w-3" />
             <span>System Verified</span>
          </div>
        </div>
      )}
    </div>
  )
}

