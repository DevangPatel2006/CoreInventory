import React from "react"
import { KPICard } from "@/components/KPICard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { motion } from "framer-motion"

const chartData = [
  { name: "Electronics", stock: 400, color: "#3b82f6" },
  { name: "Furniture", stock: 300, color: "#60a5fa" },
  { name: "Office", stock: 200, color: "#93c5fd" },
  { name: "Kitchen", stock: 278, color: "#bfdbfe" },
  { name: "Hardware", stock: 189, color: "#dbeafe" },
]

const recentActivity = [
  { id: 1, action: "Received", item: "Dell XPS 15", qty: 25, date: "2 mins ago", type: "in" },
  { id: 2, action: "Shipped", item: "Ergonomic Chair", qty: 4, date: "1 hour ago", type: "out" },
  { id: 3, action: "Adjustment", item: "Wireless Mouse", qty: -2, date: "3 hours ago", type: "adj" },
  { id: 4, action: "Low Stock", item: "A4 Paper Ream", qty: 10, date: "5 hours ago", type: "warn" },
  { id: 5, action: "Received", item: "Mechanical Keyboard", qty: 50, date: "1 day ago", type: "in" },
]

export default function Dashboard() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col space-y-2">
         <h1 className="text-4xl font-black tracking-tight text-foreground">Dashboard Overview</h1>
         <p className="text-muted-foreground font-medium text-lg italic">Dashboard to display the current statistics</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          title="Stock Receipts" 
          value="11 Ops" 
          icon={ArrowDownToLine} 
          stats={[
            { label: "To Receive", value: "4", color: "text-primary" },
            { label: "Late", value: "1", color: "text-destructive" },
            { label: "Operations", value: "6", color: "text-emerald-500" },
          ]}
        />
        <KPICard 
          title="Stock Delivery" 
          value="13 Ops" 
          icon={ArrowUpFromLine} 
          stats={[
            { label: "To Deliver", value: "4", color: "text-primary" },
            { label: "Late", value: "1", color: "text-destructive" },
            { label: "Waiting", value: "2", color: "text-amber-500" },
            { label: "Operations", value: "6", color: "text-emerald-500" },
          ]}
        />
        <KPICard 
          title="Total Products" 
          value="1,248" 
          icon={Package} 
          description="Active SKUs cataloged" 
          trend={12} 
        />
        <KPICard 
          title="Inventory Value" 
          value="4.2M" 
          icon={TrendingUp} 
          description="Total valuation (Rs)" 
          trend={8} 
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-4 antigravity-card flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-bold text-foreground">Inventory by Category</h3>
          </div>
          <div className="flex-1 p-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                     cursor={{fill: '#f1f5f9', opacity: 0.4}}
                     contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="stock" radius={[10, 10, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 antigravity-card flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>
          </div>
          <div className="flex-1 p-6">
            <div className="space-y-6">
              {recentActivity.map((activity, i) => (
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + (i * 0.05) }}
                  key={activity.id} 
                  className="flex items-center group cursor-pointer"
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                    activity.type === 'in' ? 'bg-emerald-50 text-emerald-600' :
                    activity.type === 'out' ? 'bg-primary/5 text-primary' :
                    activity.type === 'warn' ? 'bg-destructive/10 text-destructive' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.type === 'in' ? <ArrowDownToLine className="h-5 w-5" /> : 
                     activity.type === 'out' ? <ArrowUpFromLine className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {activity.action}: <span className="font-medium text-muted-foreground">{activity.item}</span>
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground mt-0.5 uppercase tracking-wider">
                      {Math.abs(activity.qty)} Units • {activity.date}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

