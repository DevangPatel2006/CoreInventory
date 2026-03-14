import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Package, AlertTriangle, TrendingUp, Truck, ArrowDownToLine, RefreshCw, ArrowUpFromLine, CheckCircle } from "lucide-react"
import { dashboardApi } from "../lib/api"

function KPI({ title, value, icon: Icon, description, loading }) {
  return (
    <div className="antigravity-card p-8 flex items-center space-x-6">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</p>
        {loading ? (
          <div className="h-9 w-24 bg-muted/50 animate-pulse rounded-lg mt-1" />
        ) : (
          <p className="text-4xl font-black text-foreground mt-1">{value ?? "—"}</p>
        )}
        <p className="text-xs font-semibold text-muted-foreground italic mt-1">{description}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [kpis, setKpis] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchAll = async () => {
    setLoading(true)
    setError("")
    try {
      const [kpiData, actData] = await Promise.all([
        dashboardApi.kpis(),
        dashboardApi.activity(),
      ])
      setKpis(kpiData)
      setActivity(actData)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground font-medium text-lg italic">Real-time inventory overview</p>
        </div>
        <button onClick={fetchAll} className="h-12 px-6 rounded-2xl border border-white/20 bg-white/50 hover:bg-white transition-all flex items-center space-x-2 font-bold text-xs uppercase tracking-widest text-muted-foreground">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="px-6 py-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold text-sm">
          ⚠ {error} — ensure the backend server is running on port 5000.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPI title="Total Products" value={kpis?.totalProducts} icon={Package} description="Active catalog items" loading={loading} />
        <KPI title="Low Stock Items" value={kpis?.lowStockCount} icon={AlertTriangle} description="Below minimum level" loading={loading} />
        <KPI title="Pending Receipts" value={kpis?.pendingReceipts} icon={ArrowDownToLine} description="Awaiting validation" loading={loading} />
        <KPI title="Pending Deliveries" value={kpis?.pendingDeliveries} icon={Truck} description="Awaiting dispatch" loading={loading} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Low Stock Alert */}
        <div className="antigravity-card p-8">
          <h2 className="text-lg font-black uppercase tracking-tight text-foreground mb-6 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Low Stock Alert</span>
          </h2>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/40 animate-pulse rounded-xl mb-3" />
            ))
          ) : kpis?.lowStockItems?.length ? (
            <div className="space-y-3">
              {kpis.lowStockItems.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-amber-50/70 rounded-xl border border-amber-100">
                  <div>
                    <p className="font-bold text-foreground text-sm">{item.product}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.sku} · {item.warehouse}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-amber-600">{item.quantity}</p>
                    <p className="text-[10px] text-muted-foreground">Min: {item.min_stock_level}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <p className="font-black text-foreground">All stock is healthy!</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="antigravity-card p-8">
          <h2 className="text-lg font-black uppercase tracking-tight text-foreground mb-6 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Recent Activity</span>
          </h2>
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/40 animate-pulse rounded-xl mb-3" />
            ))
          ) : activity.length ? (
            <div className="space-y-3">
              {activity.slice(0, 6).map((act) => (
                <div key={act.id} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-white/50 transition-all">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    act.type === "receipt" ? "bg-emerald-50 text-emerald-600" :
                    act.type === "delivery" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {act.type === "receipt" ? <ArrowDownToLine className="h-5 w-5" /> : <ArrowUpFromLine className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{act.ref_number}</p>
                    <p className="text-xs text-muted-foreground font-medium">{act.user?.name} · {act.type}</p>
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground">
                    {act.validated_at ? new Date(act.validated_at).toLocaleDateString() : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground italic font-medium">
              No completed operations yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
