import React from "react"
import { motion } from "framer-motion"
import { FileEdit, Check, X, AlertCircle } from "lucide-react"

export default function Adjustments() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
         <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Stock Adjustments</h1>
            <p className="text-muted-foreground font-medium text-lg italic">Manual corrections for inventory discrepancies</p>
         </div>
         <button className="btn-primary flex items-center space-x-2">
            <FileEdit className="h-5 w-5" />
            <span>NEW ADJUSTMENT</span>
         </button>
      </div>

      <div className="antigravity-card p-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="h-24 w-24 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
           <Check className="h-12 w-12" />
        </div>
        <div>
           <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Perfect Inventory Sync</h2>
           <p className="text-muted-foreground font-medium italic mt-2 max-w-md mx-auto">
             No stock adjustments have been recorded in the last 30 days. Your theoretical stock matches perfectly with physical counts.
           </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full ring-1 ring-emerald-200">
           <AlertCircle className="h-3 w-3" />
           <span>System Verified</span>
        </div>
      </div>
    </div>
  )
}

