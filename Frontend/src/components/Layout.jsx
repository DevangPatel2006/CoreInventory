import React from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"

export function Layout() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="h-full p-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
