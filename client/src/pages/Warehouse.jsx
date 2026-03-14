import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  Warehouse as WarehouseIcon, 
  MapPin, 
  Edit3, 
  Plus, 
  Trash2, 
  ChevronRight,
  Monitor,
  Box,
  CornerDownRight
} from "lucide-react"

const initialLocations = [
  { id: "WH/Stock", name: "Stock", type: "Internal Location", parent: "WH" },
  { id: "WH/Input", name: "Input", type: "Internal Location", parent: "WH" },
  { id: "WH/Output", name: "Output", type: "Internal Location", parent: "WH" },
  { id: "WH/Scrap", name: "Scrap", type: "Virtual Location", parent: "WH" },
]

export default function Warehouse() {
  const [locations, setLocations] = useState(initialLocations)

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Warehouse Settings</h1>
          <p className="text-muted-foreground font-medium text-lg italic">Configure storage zones and stock locations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Warehouse Form */}
        <div className="lg:col-span-1 space-y-8">
          <div className="antigravity-card p-8 space-y-8 h-fit">
            <div className="flex items-center space-x-4 mb-2">
               <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                  <WarehouseIcon className="h-6 w-6" />
               </div>
               <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Main Warehouse</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Warehouse Name</label>
                <input type="text" defaultValue="San Francisco Warehouse" className="input-premium w-full h-12 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Short Name</label>
                <input type="text" defaultValue="WH" className="input-premium w-full h-12 font-bold uppercase" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-primary" />
                  <textarea defaultValue="123 Silicon Valley Road,\nSan Francisco, CA 94105" className="input-premium pl-12 w-full h-24 font-bold pt-3" />
                </div>
              </div>
              <button className="btn-primary w-full h-14">SAVE CHANGES</button>
            </div>
          </div>

          <div className="antigravity-card p-8 bg-primary/5 border-primary/10">
             <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center">
                <Monitor className="h-4 w-4 mr-2" />
                System Integration
             </h3>
             <p className="text-xs font-semibold text-muted-foreground mt-3 leading-relaxed">
                This warehouse is linked to the <strong>SF Logistics</strong> routing rule. All incoming receipts will be automatically directed to the <strong>WH/Input</strong> location.
             </p>
          </div>
        </div>

        {/* Locations List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-4">
             <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Storage Locations</h2>
             <button className="text-sm font-bold text-primary hover:underline flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>ADD LOCATION</span>
             </button>
          </div>

          <div className="grid gap-4">
             {locations.map((loc) => (
                <motion.div 
                  whileHover={{ x: 5 }}
                  key={loc.id} 
                  className="antigravity-card p-6 flex items-center justify-between group"
                >
                   <div className="flex items-center space-x-5">
                      <div className="h-12 w-12 rounded-xl bg-white border border-white/20 flex items-center justify-center text-primary shadow-sm group-hover:shadow-md transition-all">
                         <Box className="h-6 w-6" />
                      </div>
                      <div>
                         <div className="flex items-center space-x-2">
                            <span className="text-lg font-black text-foreground">{loc.name}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-gray-100 text-muted-foreground">
                               {loc.type}
                            </span>
                         </div>
                         <div className="flex items-center text-xs font-bold text-muted-foreground mt-1 lowercase tracking-wider">
                            <CornerDownRight className="h-3 w-3 mr-1" />
                            {loc.id}
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white rounded-lg text-muted-foreground hover:text-primary transition-all">
                         <Edit3 className="h-5 w-5" />
                      </button>
                      <button className="p-2 hover:bg-white rounded-lg text-muted-foreground hover:text-destructive transition-all">
                         <Trash2 className="h-5 w-5" />
                      </button>
                      <button className="p-2 hover:bg-white rounded-lg text-muted-foreground">
                         <ChevronRight className="h-5 w-5" />
                      </button>
                   </div>
                </motion.div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}
