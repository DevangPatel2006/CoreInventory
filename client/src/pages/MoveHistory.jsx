import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  RefreshCw, 
  Filter, 
  User, 
  Calendar,
  MoreVertical,
  ClipboardList
} from "lucide-react"

const logs = [
  { id: "LOG-004", date: "2026-01-16 14:32", type: "Delivery (Shipped)", reference: "WH/OUT/0001", product: "Ergonomic Office Chair", qty: -4, user: "Mitchell Admin", status: "Done" },
  { id: "LOG-003", date: "2026-01-16 09:15", type: "Adjustment", reference: "ADJ-0092", product: "Wireless Mouse", qty: -2, user: "System", status: "Done" },
  { id: "LOG-002", date: "2026-01-15 11:20", type: "Receipt", reference: "WH/IN/0002", product: "A4 Paper Ream", qty: 400, user: "Mitchell Admin", status: "Done" },
  { id: "LOG-001", date: "2026-01-14 16:45", type: "Receipt", reference: "WH/IN/0001", product: "Dell XPS 15", qty: 25, user: "Mitchell Admin", status: "Done" },
]

export default function MoveHistory() {
  const [search, setSearch] = useState("")

  const filteredLogs = logs.filter(l => 
    l.product.toLowerCase().includes(search.toLowerCase()) || 
    l.reference.toLowerCase().includes(search.toLowerCase()) ||
    l.user.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Move History</h1>
          <p className="text-muted-foreground font-medium text-lg italic">Complete audit log of inventory transactions</p>
        </div>
        <button className="h-12 px-6 rounded-xl border border-white/20 bg-white/50 text-muted-foreground hover:text-foreground hover:bg-white transition-all flex items-center space-x-2 font-bold uppercase tracking-widest text-xs">
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      <div className="glass p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by product, reference, or user..." 
            className="input-premium pl-12 w-full h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="h-12 px-6 rounded-xl border border-white/20 bg-white/50 text-muted-foreground hover:text-foreground hover:bg-white transition-all flex items-center space-x-2 font-semibold">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      <div className="antigravity-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/30">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Log ID / Date</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Type & Reference</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Product</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right px-10">Quantity</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Responsible</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-primary/5 transition-colors group">
                <td className="px-6 py-5">
                   <div className="font-mono text-xs font-bold text-muted-foreground">{log.id}</div>
                   <div className="text-sm font-semibold text-foreground mt-1">{log.date}</div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-lg ${
                        log.qty > 0 ? "bg-emerald-50 text-emerald-600" : "bg-destructive/10 text-destructive"
                      }`}>
                         {log.qty > 0 ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
                      </div>
                      <span className={`text-xs font-black uppercase tracking-wider ${
                        log.qty > 0 ? "text-emerald-600" : "text-destructive"
                      }`}>{log.type}</span>
                   </div>
                   <div className="text-sm font-bold text-primary mt-1 underline underline-offset-4 decoration-primary/30 cursor-pointer">{log.reference}</div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-muted-foreground">
                        <ClipboardList className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-foreground">{log.product}</span>
                   </div>
                </td>
                <td className="px-6 py-5 text-right px-10">
                   <span className={`text-xl font-black ${(log.qty > 0) ? "text-emerald-600" : "text-destructive"}`}>
                      {log.qty > 0 ? "+" : ""}{log.qty}
                   </span>
                   <span className="text-[10px] font-black uppercase tracking-widest ml-2 opacity-50">Units</span>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-bold text-muted-foreground">{log.user}</span>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

