import React, { useState, useEffect } from "react"
import { Search, Filter, RefreshCw, ArrowDownToLine, ArrowUpFromLine, User, ClipboardList } from "lucide-react"
import { movesApi } from "../lib/api"

export default function MoveHistory() {
  const [moves, setMoves] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchMoves = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await movesApi.list()
      setMoves(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMoves() }, [])

  const filtered = moves.filter(m =>
    m.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.operation?.ref_number?.toLowerCase().includes(search.toLowerCase()) ||
    m.operation?.user?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Move History</h1>
          <p className="text-muted-foreground font-medium text-lg italic">Complete audit log of inventory transactions</p>
        </div>
        <button onClick={fetchMoves} className="h-12 px-6 rounded-xl border border-white/20 bg-white/50 hover:bg-white transition-all flex items-center space-x-2 font-bold uppercase tracking-widest text-xs text-muted-foreground">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {error && <div className="px-6 py-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold text-sm">⚠ {error}</div>}

      <div className="glass p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input type="text" placeholder="Search by product, reference, or user..."
            className="input-premium pl-12 w-full h-12" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="antigravity-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-muted/40 animate-pulse rounded-xl" />)}</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/30">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Date</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Type & Reference</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Quantity</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Responsible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(m => {
                const isIn = m.operation?.type === "receipt"
                const qty = Number(m.qty)
                return (
                  <tr key={m.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold text-foreground">{new Date(m.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-lg ${isIn ? "bg-emerald-50 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
                          {isIn ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
                        </div>
                        <span className={`text-xs font-black uppercase tracking-wider ${isIn ? "text-emerald-600" : "text-destructive"}`}>
                          {m.operation?.type}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-primary mt-1">{m.operation?.ref_number}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-muted-foreground">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-foreground">{m.product?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={`text-xl font-black ${isIn ? "text-emerald-600" : "text-destructive"}`}>
                        {isIn ? "+" : "-"}{qty}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest ml-2 opacity-50">Units</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">{m.operation?.user?.name || "System"}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!filtered.length && (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-muted-foreground italic font-medium">
                  No stock moves recorded yet. Validate a receipt or delivery to see entries here.
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
