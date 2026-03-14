import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Warehouse as WarehouseIcon, MapPin, Edit3, Plus, Trash2, ChevronRight, Box, CornerDownRight, RefreshCw, X, CheckCircle } from "lucide-react"
import { warehousesApi } from "../lib/api"

export default function Warehouse() {
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [form, setForm] = useState({ name: "", short_code: "", address: "" })

  const fetchWarehouses = async () => {
    setLoading(true)
    setError("")
    try { setWarehouses(await warehousesApi.list()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchWarehouses() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name || !form.short_code) return setFormError("Name and short code are required")
    setSubmitting(true); setFormError("")
    try {
      await warehousesApi.create(form)
      setIsModalOpen(false)
      setForm({ name: "", short_code: "", address: "" })
      await fetchWarehouses()
    } catch (e) { setFormError(e.message) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Warehouse Settings</h1>
          <p className="text-muted-foreground font-medium text-lg italic">Configure storage warehouses and locations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchWarehouses} className="h-12 px-4 rounded-xl border border-white/20 bg-white/50 hover:bg-white text-muted-foreground transition-all">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center space-x-2">
            <Plus className="h-5 w-5" /><span>ADD WAREHOUSE</span>
          </button>
        </div>
      </div>

      {error && <div className="px-6 py-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold text-sm">⚠ {error}</div>}

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted/40 animate-pulse rounded-3xl" />)}</div>
      ) : warehouses.length ? (
        <div className="grid gap-4">
          {warehouses.map(wh => (
            <motion.div whileHover={{ x: 5 }} key={wh.id} className="antigravity-card p-6 flex items-center justify-between group">
              <div className="flex items-center space-x-5">
                <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                  <WarehouseIcon className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-black text-foreground">{wh.name}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      {wh.short_code}
                    </span>
                  </div>
                  {wh.address && (
                    <div className="flex items-center text-sm font-medium text-muted-foreground mt-1 space-x-1">
                      <MapPin className="h-4 w-4" /><span>{wh.address}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center space-x-1 text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-2 rounded-xl">
                  <CheckCircle className="h-3 w-3" /><span>Active</span>
                </div>
                <button className="p-2 hover:bg-white rounded-lg text-muted-foreground">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="antigravity-card p-20 text-center space-y-4">
          <WarehouseIcon className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <h2 className="text-2xl font-black text-foreground tracking-tight">No Warehouses Yet</h2>
          <p className="text-muted-foreground font-medium italic">Add your first warehouse to start tracking inventory locations.</p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary mx-auto">ADD FIRST WAREHOUSE</button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg antigravity-card p-10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-foreground tracking-tight">Add Warehouse</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
                <X className="h-6 w-6 text-muted-foreground" />
              </button>
            </div>
            {formError && <div className="mb-6 px-5 py-3 rounded-xl bg-destructive/10 text-destructive font-bold text-sm">{formError}</div>}
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Warehouse Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Main Warehouse" className="input-premium w-full h-12 font-bold" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Short Code</label>
                <input value={form.short_code} onChange={e => setForm(f => ({ ...f, short_code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. MAIN" maxLength={6} className="input-premium w-full h-12 font-black uppercase tracking-widest" required />
                <p className="text-xs text-muted-foreground">Used in reference numbers (e.g. MAIN/IN/001)</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Address (Optional)</label>
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="123 Street, City..." rows={3} className="input-premium w-full pt-3 font-medium" />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 h-14 rounded-2xl font-black text-muted-foreground uppercase tracking-widest hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary h-14 px-10">
                  {submitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : "CREATE"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
