import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Search, 
  Truck, 
  List, 
  LayoutGrid, 
  Printer, 
  X, 
  Check, 
  ChevronRight,
  User,
  Calendar,
  MoreVertical,
  Filter,
  AlertCircle
} from "lucide-react"

const initialDeliveries = [
  { id: "WH/OUT/0001", contact: "Azure Interior", date: "2026-01-15", status: "Ready", source: "SO001", responsible: "Mitchell Admin", items: [
    { product: "[DESK001] Desk", quantity: 2, onHand: 50 },
    { product: "[CHAIR002] Office Chair", quantity: 5, onHand: 12 }
  ]},
  { id: "WH/OUT/0002", contact: "TechCorp Global", date: "2026-01-16", status: "Waiting", source: "SO004", responsible: "Mitchell Admin", items: [
    { product: "[MON001] Monitor", quantity: 50, onHand: 20 } // Out of stock
  ]},
  { id: "WH/OUT/0003", contact: "OfficeSupplies Inc", date: "2026-01-11", status: "Done", source: "SO003", responsible: "Mitchell Admin", items: [
    { product: "[PAPER001] A4 Paper", quantity: 10, onHand: 100 }
  ]},
]

const StatusBadge = ({ status }) => {
  const styles = {
    "Draft": "bg-gray-100 text-gray-700 border-gray-200",
    "Waiting": "bg-amber-50 text-amber-700 border-amber-200",
    "Ready": "bg-blue-50 text-blue-700 border-blue-200",
    "Done": "bg-emerald-50 text-emerald-700 border-emerald-200",
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
      {status}
    </span>
  )
}

export default function Deliveries() {
  const [view, setView] = useState("list")
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [deliveries, setDeliveries] = useState(initialDeliveries)
  const [search, setSearch] = useState("")

  const filteredDeliveries = deliveries.filter(r => 
    r.id.toLowerCase().includes(search.toLowerCase()) || 
    r.contact.toLowerCase().includes(search.toLowerCase())
  )

  const openForm = (delivery) => {
    setSelectedDelivery(delivery)
    setView("form")
  }

  const handleValidate = () => {
    setDeliveries(deliveries.map(d => 
      d.id === selectedDelivery.id ? { ...d, status: "Done" } : d
    ))
    setSelectedDelivery({ ...selectedDelivery, status: "Done" })
  }

  return (
    <div className="space-y-8 min-h-full">
      <AnimatePresence mode="wait">
        {view !== "form" ? (
          <motion.div
            key="list-kanban"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-foreground">Stock Delivery</h1>
                <p className="text-muted-foreground font-medium text-lg italic">Outgoing stock to customers</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="glass p-1 rounded-xl flex items-center">
                  <button 
                    onClick={() => setView("list")}
                    className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setView("kanban")}
                    className={`p-2 rounded-lg transition-all ${view === "kanban" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </button>
                </div>
                <button 
                  onClick={() => openForm({ id: `WH/OUT/000${deliveries.length + 1}`, contact: "", date: new Date().toISOString().split('T')[0], status: "Draft", items: [], responsible: "Mitchell Admin" })}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>NEW DELIVERY</span>
                </button>
              </div>
            </div>

            <div className="glass p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 text-card-foreground">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground font-medium" />
                <input 
                  type="text" 
                  placeholder="Search by reference or contact..." 
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

            {view === "list" ? (
              <div className="antigravity-card overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/30">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Reference</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Contact</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Schedule Date</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground px-10">Status</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredDeliveries.map((r) => (
                      <tr key={r.id} onClick={() => openForm(r)} className="hover:bg-primary/5 transition-colors cursor-pointer group">
                        <td className="px-6 py-5 font-bold text-primary">{r.id}</td>
                        <td className="px-6 py-5 font-semibold text-foreground">{r.contact}</td>
                        <td className="px-6 py-5 text-muted-foreground font-medium">{r.date}</td>
                        <td className="px-6 py-5">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white rounded-lg transition-all text-muted-foreground">
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDeliveries.map((r) => (
                  <motion.div
                    layoutId={r.id}
                    key={r.id}
                    onClick={() => openForm(r)}
                    className="antigravity-card p-6 cursor-pointer space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <StatusBadge status={r.status} />
                      <button className="text-muted-foreground hover:text-foreground transition-colors"><MoreVertical className="h-5 w-5" /></button>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-foreground">{r.id}</h3>
                      <p className="font-bold text-primary">{r.contact}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <Calendar className="h-4 w-4 mr-2" />
                        {r.date}
                      </div>
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="form-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {/* Form Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex items-center space-x-4">
                <button onClick={() => setView("list")} className="p-2 hover:bg-white rounded-xl transition-all text-muted-foreground">
                  <X className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-foreground">{selectedDelivery.id}</h1>
                  <p className="text-muted-foreground font-medium italic">Processing outgoing shipment</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="h-12 px-6 rounded-xl bg-white text-muted-foreground font-bold border border-white/20 hover:bg-gray-50 transition-all shadow-sm uppercase tracking-wider text-xs">PRINT</button>
                <button className="h-12 px-6 rounded-xl bg-white text-destructive font-bold border border-destructive/10 hover:bg-destructive/5 transition-all shadow-sm uppercase tracking-wider text-xs">CANCEL</button>
                {selectedDelivery.status !== "Done" && (
                  <button onClick={handleValidate} className="btn-primary flex items-center space-x-2">
                    <Check className="h-5 w-5" />
                    <span>VALIDATE</span>
                  </button>
                )}
              </div>
            </div>

            {/* Status Stepper */}
            <div className="glass p-6 rounded-3xl flex items-center justify-center">
              <div className="flex items-center w-full max-w-lg relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 transition-all duration-500 rounded-full" 
                  style={{ width: selectedDelivery.status === "Draft" ? "0%" : selectedDelivery.status === "Waiting" ? "33%" : selectedDelivery.status === "Ready" ? "66%" : "100%" }}
                />
                
                {["Draft", "Waiting", "Ready", "Done"].map((step, i) => (
                  <div key={step} className="relative z-10 flex flex-col items-center flex-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 scale-110 ${
                      selectedDelivery.status === step || (selectedDelivery.status === "Done") || (selectedDelivery.status === "Ready" && i < 2) || (selectedDelivery.status === "Waiting" && i < 1)
                      ? "bg-primary border-white shadow-lg text-white" 
                      : "bg-white border-gray-200 text-gray-400"
                    }`}>
                      {selectedDelivery.status === "Done" || (selectedDelivery.status === "Ready" && i < 2) ? <Check className="h-6 w-6" /> : i + 1}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest mt-3 ${
                       selectedDelivery.status === step ? "text-primary" : "text-muted-foreground"
                    }`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="antigravity-card p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Delivery Address</label>
                  <input type="text" defaultValue={selectedDelivery.contact} className="input-premium w-full h-14 text-lg font-bold text-foreground" placeholder="Azure Interior" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Source Document</label>
                  <input type="text" defaultValue={selectedDelivery.source} className="input-premium w-full h-14 text-lg font-bold text-foreground" placeholder="SO001" />
                </div>
              </div>
              <div className="antigravity-card p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Schedule Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    <input type="date" defaultValue={selectedDelivery.date} className="input-premium pl-12 w-full h-14 text-lg font-bold text-foreground" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Responsible</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    <input type="text" readOnly defaultValue={selectedDelivery.responsible} className="input-premium pl-12 w-full h-14 text-lg font-bold bg-white/30 text-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Out of Stock Warning */}
            {selectedDelivery.items.some(item => item.quantity > item.onHand) && (
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-destructive/10 border border-destructive/20 p-6 rounded-3xl flex items-center space-x-4"
              >
                <div className="h-12 w-12 rounded-2xl bg-destructive/20 flex items-center justify-center text-destructive">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-black text-destructive uppercase tracking-widest text-sm">Stock Availability Issue</h4>
                  <p className="text-sm font-semibold text-destructive/80 mt-0.5">Some products in this delivery are not currently in stock. Please check the line items highlighted in red.</p>
                </div>
              </motion.div>
            )}

            {/* Line Items */}
            <div className="antigravity-card overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-black text-foreground uppercase tracking-widest">Operations / Delivery Lines</h3>
                <button className="text-sm font-bold text-primary hover:underline underline-offset-4 decoration-2">ADD A PRODUCT</button>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/30">
                    <th className="px-10 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Product</th>
                    <th className="px-10 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Reserved</th>
                    <th className="px-10 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">On Hand</th>
                    <th className="px-10 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {selectedDelivery.items.map((item, i) => {
                    const isOutOfStock = item.quantity > item.onHand;
                    return (
                      <tr key={i} className={`transition-all ${isOutOfStock ? 'bg-destructive/[0.03]' : 'hover:bg-primary/5'}`}>
                        <td className="px-10 py-5 font-bold text-foreground">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200" />
                            <span className={isOutOfStock ? 'text-destructive' : ''}>{item.product}</span>
                          </div>
                        </td>
                        <td className={`px-10 py-5 text-right font-black ${isOutOfStock ? 'text-destructive' : 'text-muted-foreground'}`}>{item.quantity}</td>
                        <td className={`px-10 py-5 text-right font-black ${isOutOfStock ? 'text-destructive' : 'text-muted-foreground opacity-50'}`}>{item.onHand}</td>
                        <td className="px-10 py-5 text-right">
                          <input 
                            type="number" 
                            disabled={isOutOfStock}
                            defaultValue={selectedDelivery.status === "Done" ? item.quantity : 0} 
                            className={`w-24 h-10 text-right bg-white/50 border border-white/30 rounded-lg pr-3 font-black outline-none focus:border-primary/50 ${isOutOfStock ? 'opacity-30 cursor-not-allowed' : 'text-primary'}`} 
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

