import React from "react"
import { useLocation, Link } from "react-router-dom"
import { Search, Bell, User, ChevronRight } from "lucide-react"

export function Header() {
  const location = useLocation()
  const pathnames = location.pathname.split("/").filter((x) => x)

  return (
    <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between glass sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`
            const isLast = index === pathnames.length - 1
            return (
              <React.Fragment key={name}>
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
                <Link
                  to={routeTo}
                  className={`capitalize ${
                    isLast ? "text-foreground font-semibold" : "hover:text-primary transition-colors"
                  }`}
                >
                  {name.replace("-", " ")}
                </Link>
              </React.Fragment>
            )
          })}
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search operations, products..."
            className="input-premium pl-10 w-64 text-sm"
          />
        </div>

        <div className="flex items-center space-x-3">
          <button className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-white/50 transition-all relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full border-2 border-white" />
          </button>
          
          <div className="h-10 w-px bg-white/20 mx-2" />
          
          <button className="flex items-center space-x-3 hover:bg-white/50 p-1 pr-3 rounded-xl transition-all">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">Mitchell Admin</span>
          </button>
        </div>
      </div>
    </header>
  )
}
