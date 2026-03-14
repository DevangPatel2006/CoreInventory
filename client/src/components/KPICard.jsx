import * as React from "react"
import { motion } from "framer-motion"

export function KPICard({ title, value, icon: Icon, description, trend, stats }) {
  return (
    <motion.div 
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="antigravity-card p-6 flex flex-col justify-between h-full group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
          {Icon && <Icon className="h-6 w-6" />}
        </div>
        {trend && (
          <div className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">{title}</h3>
        <div className="text-3xl font-black text-foreground tracking-tight">{value}</div>
      </div>

      {stats ? (
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className={`text-sm font-bold ${s.color || "text-foreground"}`}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter truncate">{s.label}</div>
            </div>
          ))}
        </div>
      ) : (
        description && (
          <p className="text-xs text-muted-foreground mt-4 font-medium italic">
            {description}
          </p>
        )
      )}
    </motion.div>
  )
}

