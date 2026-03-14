import React from "react"
import { NavLink } from "react-router-dom"
import { LayoutDashboard, Package, Receipt, Truck, ArrowLeftRight, FileEdit, History, Settings } from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Receipts", href: "/receipts", icon: Receipt },
  { name: "Deliveries", href: "/deliveries", icon: Truck },
  { name: "Transfers", href: "/transfers", icon: ArrowLeftRight },
  { name: "Adjustments", href: "/adjustments", icon: FileEdit },
  { name: "Move History", href: "/move-history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-card px-4 py-6">
      <div className="mb-8 px-4 flex items-center space-x-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
           <Package className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">CoreInventory</h1>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
