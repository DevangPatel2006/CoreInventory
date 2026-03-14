import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Settings as SettingsIcon, 
  Palette, 
  Globe, 
  Users, 
  Database, 
  ShieldCheck, 
  Bell, 
  Check, 
  RefreshCw,
  Search,
  Plus
} from "lucide-react"

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-300 w-full ${
      active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
    }`}
  >
    <Icon className="h-5 w-5" />
    <span className="font-black uppercase tracking-widest text-xs">{label}</span>
  </button>
)

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general")

  const renderContent = () => {
    switch(activeTab) {
      case "general":
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="antigravity-card p-10 space-y-8">
               <div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">Application Theme</h3>
                  <p className="text-sm font-medium text-muted-foreground italic">Customize the look and feel of CoreInventory</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Primary Accent Color</label>
                     <div className="flex space-x-3">
                        {["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"].map(color => (
                          <div key={color} className="h-10 w-10 rounded-full border-2 border-white cursor-pointer shadow-sm hover:scale-110 transition-all" style={{ backgroundColor: color }}>
                             {color === "#3b82f6" && <Check className="h-6 w-6 text-white m-auto mt-1" />}
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-4">
                     <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Interface Mode</label>
                     <div className="glass p-1 rounded-xl flex">
                        <button className="flex-1 h-10 rounded-lg bg-primary text-white font-black text-[10px] uppercase tracking-widest">Glass Dark</button>
                        <button className="flex-1 h-10 rounded-lg text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-foreground">Glass Light</button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="antigravity-card p-10 space-y-8">
               <div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">API Configuration</h3>
                  <p className="text-sm font-medium text-muted-foreground italic">Connect to external services and ERP systems</p>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Backend API Endpoint</label>
                    <input type="text" defaultValue="https://api.coreinventory.cloud/v1" className="input-premium w-full h-12 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">API Master Key</label>
                    <div className="relative">
                       <input type="password" defaultValue="sk_test_51MzS2JSCYx87cM..." className="input-premium w-full h-12 font-bold pr-12" />
                       <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )
      case "users":
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center mb-4">
               <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" placeholder="Search users..." className="input-premium pl-10 w-full h-10 text-sm font-bold" />
               </div>
               <button className="btn-primary h-10 px-6 flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span className="text-[10px] font-black">ADD USER</span>
               </button>
            </div>

            <div className="antigravity-card overflow-hidden">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-white/10 bg-white/30">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Login</th>
                        <th className="px-6 py-4"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {[
                       { name: "Mitchell Admin", email: "admin@coreinventory.com", role: "Administrator", last: "Active now" },
                       { name: "Marc Demo", email: "marc@demo.com", role: "Inventory Manager", last: "2 hours ago" },
                       { name: "Joel Stocks", email: "joel@warehouse.com", role: "Worker", last: "Yesterday" },
                     ].map((u, i) => (
                        <tr key={i} className="hover:bg-primary/5 transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                 <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                                    {u.name.split(' ').map(n=>n[0]).join('')}
                                 </div>
                                 <div>
                                    <div className="font-bold text-foreground text-sm">{u.name}</div>
                                    <div className="text-[10px] font-medium text-muted-foreground lowercase">{u.email}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 font-bold text-xs text-primary uppercase tracking-wider">{u.role}</td>
                           <td className="px-6 py-4 text-xs font-medium text-muted-foreground italic">{u.last}</td>
                           <td className="px-6 py-4 text-right">
                              <button className="p-2 hover:bg-white rounded-lg text-muted-foreground"><MoreVertical className="h-4 w-4" /></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </motion.div>
        )
      default:
        return <div className="text-muted-foreground italic">Coming soon...</div>
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Global Settings</h1>
          <p className="text-muted-foreground font-medium text-lg italic">Manage system preferences and access control</p>
        </div>
        <button className="btn-primary h-12 px-8 flex items-center space-x-3">
          <RefreshCw className="h-5 w-5" />
          <span>SYNC SYSTEM</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 glass p-2 rounded-3xl space-y-2">
           <TabButton active={activeTab === 'general'} icon={Palette} label="General & Theme" onClick={() => setActiveTab('general')} />
           <TabButton active={activeTab === 'users'} icon={Users} label="User Management" onClick={() => setActiveTab('users')} />
           <TabButton active={activeTab === 'database'} icon={Database} label="Data & Storage" onClick={() => setActiveTab('database')} />
           <TabButton active={activeTab === 'notif'} icon={Bell} label="Notifications" onClick={() => setActiveTab('notif')} />
           <TabButton active={activeTab === 'security'} icon={ShieldCheck} label="Security & API" onClick={() => setActiveTab('security')} />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
           <AnimatePresence mode="wait">
              {renderContent()}
           </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
