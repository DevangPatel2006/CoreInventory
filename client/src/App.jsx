import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/Layout"
import { useAuth } from "./contexts/AuthContext"

// Pages
import Dashboard from "./pages/Dashboard"
import Products from "./pages/Products"
import Receipts from "./pages/Receipts"
import Deliveries from "./pages/Deliveries"
import Transfers from "./pages/Transfers"
import Adjustments from "./pages/Adjustments"
import MoveHistory from "./pages/MoveHistory"
import Login from "./pages/Login"
import Warehouse from "./pages/Warehouse"
import Settings from "./pages/Settings"

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading…</div>
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/receipts" element={<Receipts />} />
        <Route path="/deliveries" element={<Deliveries />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/adjustments" element={<Adjustments />} />
        <Route path="/move-history" element={<MoveHistory />} />
        <Route path="/warehouse" element={<Warehouse />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      {/* Redirect root to dashboard (PrivateRoute handles auth) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
