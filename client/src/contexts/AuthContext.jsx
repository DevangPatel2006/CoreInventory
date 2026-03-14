import React, { createContext, useContext, useState, useEffect } from "react"
import { authApi } from "../lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session on mount
    try {
      const savedUser = localStorage.getItem("ci_user")
      const savedToken = localStorage.getItem("ci_token")
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser))
      }
    } catch (_) {}
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    localStorage.setItem("ci_token", data.token)
    localStorage.setItem("ci_user", JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (name, email, password) => {
    const data = await authApi.register(name, email, password)
    return data
  }

  const logout = () => {
    localStorage.removeItem("ci_token")
    localStorage.removeItem("ci_user")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
