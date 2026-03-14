import React, { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Truck, 
  ArrowLeftRight, 
  FileEdit, 
  History, 
  Settings, 
  ChevronDown, 
  Warehouse,
  ChevronRight
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { 
    name: "Operations", 
    icon: Receipt,
    submenu: [
      { name: "Receipts", href: "/receipts", icon: Receipt },
      { name: "Delivery", href: "/deliveries", icon: Truck },
      { name: "Adjustment", href: "/adjustments", icon: FileEdit },
    ]
  },
  { name: "Products/Stock", href: "/products", icon: Package },
  { name: "Move History", href: "/move-history", icon: History },
  { name: "Warehouse", href: "/warehouse", icon: Warehouse },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const [openSubmenu, setOpenSubmenu] = useState("Operations")
  const location = useLocation()

  return (
    <div className="flex h-screen w-72 flex-col glass border-r border-white/20 px-6 py-8 relative z-20">
      <div className="mb-10 px-2 flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
           <Package className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">CoreInventory</h1>
          <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">Enterprise</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          if (item.submenu) {
            const isOpen = openSubmenu === item.name
            const Icon = item.icon
            const isSubChildActive = item.submenu.some(sub => location.pathname === sub.href)

            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => setOpenSubmenu(isOpen ? null : item.name)}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isOpen || isSubChildActive ? "text-primary" : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-primary/5 rounded-xl ml-4"
                    >
                      {item.submenu.map((sub) => (
                        <NavLink
                          key={sub.href}
                          to={sub.href}
                          className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
                              isActive
                                ? "text-primary font-bold"
                                : "text-muted-foreground hover:text-foreground"
                            }`
                          }
                        >
                          <sub.icon className="h-4 w-4" />
                          <span>{sub.name}</span>
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          }

          const Icon = item.icon
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                    : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center space-x-3 px-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-blue-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">Mitchell Admin</p>
            <p className="text-xs text-muted-foreground truncate">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  )
}

