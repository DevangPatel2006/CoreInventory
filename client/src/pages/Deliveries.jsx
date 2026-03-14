import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, X, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"
import { deliveriesApi, productsApi, warehousesApi } from "../lib/api"

const STATUS_STEPS = ["draft", "waiting", "ready", "done"]

function StatusBadge({ status }) {
  const cfg = {
    draft:     "bg-gray-100 text-gray-600",
    waiting:   "bg-amber-100 text-amber-700",
    ready:     "bg-blue-100 text-blue-700",
    done:      "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  }
  return <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${cfg[status] || cfg.draft}`}>{status}</span>
}

function Stepper({ status }) {
  const current = STATUS_STEPS.indexOf(status)
  return (
    <div className="flex items-center space-x-2">
      {STATUS_STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center space-y-1">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              i < current ? "bg-primary text-white" :
              i === current ? "bg-primary text-white ring-4 ring-primary/20" :
              "bg-muted text-muted-foreground"
            }`}>{i < current ? "✓" : i + 1}</div>
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{step}</span>
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 transition-all ${i < current ? "bg-primary" : "bg-muted"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [view, setView] = useState("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [validating, setValidating] = useState(false)
  const [form, setForm] = useState({ contact_name: "", moves: [{ product_id: "", qty: 1, from_location: "" }] })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [devs, prods, whs] = await Promise.all([deliveriesApi.list(), productsApi.list(), warehousesApi.list()])
      setDeliveries(devs)
      setProducts(prods)
      setWarehouses(whs)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const openNew = () => { setSelectedDelivery(null); setForm({ contact_name: "", moves: [{ product_id: "", qty: 1, from_location: warehouses[0]?.id || "" }] }); setView("form") }
  const openEdit = (d) => { setSelectedDelivery(d); setView("form") }
  const addMoveLine = () => setForm(f => ({ ...f, moves: [...f.moves, { product_id: "", qty: 1, from_location: warehouses[0]?.id || "" }] }))
  const removeMoveLine = (i) => setForm(f => ({ ...f, moves: f.moves.filter((_, idx) => idx !== i) }))
  const setMove = (i, field, val) => setForm(f => ({ ...f, moves: f.moves.map((m, idx) => idx === i ? { ...m, [field]: val } : m) }))

  const getStock = (productId, warehouseId) => {
    const p = products.find(pr => pr.id === productId)
    if (!p) return null
    const loc = p.stock_locations?.find(l => l.warehouse_id === warehouseId)
    return loc ? Number(loc.quantity) : 0
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (form.moves.some(m => !m.product_id || !m.from_location)) return setFormError("Fill all product and warehouse fields")
    setSubmitting(true); setFormError("")
    try {
      await deliveriesApi.create({ contact_name: form.contact_name, moves: form.moves.map(m => ({ product_id: m.product_id, qty: Number(m.qty), from_location: m.from_location })) })
      await fetchAll(); setView("list")
    } catch (e) { setFormError(e.message) }
    finally { setSubmitting(false) }
  }

  const handleValidate = async (id) => {
    setValidating(true)
    try { await deliveriesApi.validate(id); await fetchAll(); setView("list") }
    catch (e) { alert(e.message) }
    finally { setValidating(false) }
  }

  const filtered = deliveries.filter(d =>
    d.ref_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.contact_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (view === "form") {
    const d = selectedDelivery
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => setView("list")} className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary mb-2 flex items-center space-x-1">
              <span>←</span><span>Back to Deliveries</span>
            </button>
            <h1 className="text-4xl font-black tracking-tight">{d ? d.ref_number : "New Delivery"}</h1>
          </div>
          {d && d.status !== "done" && (
            <button onClick={() => handleValidate(d.id)} disabled={validating} className="btn-primary flex items-center space-x-2">
              {validating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <><CheckCircle className="h-5 w-5" /><span>VALIDATE</span></>}
            </button>
          )}
        </div>

        {d && <div className="antigravity-card p-8"><Stepper status={d.status} /></div>}

        {!d && (
          <div className="antigravity-card p-10">
            {formError && <div className="mb-6 px-5 py-3 rounded-xl bg-destructive/10 text-destructive font-bold text-sm">{formError}</div>}
            <form onSubmit={handleCreate} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Customer / Contact</label>
                <input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                  placeholder="e.g. John Smith" className="input-premium w-full h-12 font-bold" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Product Lines</h3>
                  <button type="button" onClick={addMoveLine} className="text-xs font-black text-primary hover:underline flex items-center space-x-1"><Plus className="h-4 w-4" /><span>ADD LINE</span></button>
                </div>
                <div className="space-y-4">
                  {form.moves.map((m, i) => {
                    const avail = m.product_id && m.from_location ? getStock(m.product_id, m.from_location) : null
                    const isOutOfStock = avail !== null && Number(m.qty) > avail
                    return (
                      <div key={i} className={`grid grid-cols-12 gap-4 items-center p-3 rounded-xl ${isOutOfStock ? "bg-destructive/5 border border-destructive/20" : ""}`}>
                        {isOutOfStock && (
                          <div className="col-span-12 flex items-center space-x-2 text-destructive text-xs font-bold mb-1">
                            <AlertTriangle className="h-4 w-4" /><span>Insufficient stock (available: {avail})</span>
                          </div>
                        )}
                        <div className="col-span-5">
                          <select value={m.product_id} onChange={e => setMove(i, "product_id", e.target.value)} className="input-premium w-full h-12 font-bold appearance-none">
                            <option value="">Select Product</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input type="number" min="1" value={m.qty} onChange={e => setMove(i, "qty", e.target.value)}
                            className={`input-premium w-full h-12 font-bold text-center ${isOutOfStock ? "border-destructive" : ""}`} />
                        </div>
                        <div className="col-span-4">
                          <select value={m.from_location} onChange={e => setMove(i, "from_location", e.target.value)} className="input-premium w-full h-12 font-bold appearance-none">
                            <option value="">Source</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </select>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          {form.moves.length > 1 && <button type="button" onClick={() => removeMoveLine(i)} className="p-2 text-muted-foreground hover:text-destructive"><X className="h-5 w-5" /></button>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={() => setView("list")} className="px-8 h-14 rounded-2xl font-black text-muted-foreground uppercase tracking-widest hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary h-14 px-10">
                  {submitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : "SAVE DELIVERY"}
                </button>
              </div>
            </form>
          </div>
        )}

        {d && (
          <div className="antigravity-card overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="border-b border-white/10 bg-white/30">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Qty</th>
              </tr></thead>
              <tbody className="divide-y divide-white/5">
                {d.moves?.map(m => (
                  <tr key={m.id}>
                    <td className="px-6 py-4 font-bold">{m.product?.name}</td>
                    <td className="px-6 py-4 text-right font-black text-primary">{Number(m.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Deliveries</h1>
          <p className="text-muted-foreground font-medium text-lg italic">Outgoing shipments to customers</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchAll} className="h-12 px-4 rounded-xl border border-white/20 bg-white/50 hover:bg-white text-muted-foreground transition-all">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={openNew} className="btn-primary flex items-center space-x-2"><Plus className="h-5 w-5" /><span>NEW DELIVERY</span></button>
        </div>
      </div>

      {error && <div className="px-6 py-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold text-sm">⚠ {error}</div>}

      <div className="glass p-4 rounded-2xl flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input type="text" placeholder="Search by reference or customer..." className="input-premium pl-12 w-full h-12"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="antigravity-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted/40 animate-pulse rounded-xl" />)}</div>
        ) : (
          <table className="w-full text-left">
            <thead><tr className="border-b border-white/10 bg-white/30">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Reference</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Customer</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Date</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => openEdit(d)}>
                  <td className="px-6 py-5 font-bold text-primary underline underline-offset-4 decoration-primary/30">{d.ref_number}</td>
                  <td className="px-6 py-5 font-semibold text-muted-foreground">{d.contact_name || "—"}</td>
                  <td className="px-6 py-5 font-semibold text-muted-foreground text-sm">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-5"><StatusBadge status={d.status} /></td>
                  <td className="px-6 py-5 text-right" onClick={e => e.stopPropagation()}>
                    {d.status !== "done" && d.status !== "cancelled" && (
                      <button onClick={() => handleValidate(d.id)}
                        className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:underline">VALIDATE</button>
                    )}
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-muted-foreground italic font-medium">No deliveries yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
