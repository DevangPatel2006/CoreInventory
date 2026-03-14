import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Package } from "lucide-react"

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate("/")
    }, 800)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <Package className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome to CoreInventory</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your inventory</p>
        </div>

        <Card className="border shadow-lg">
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle className="text-xl">Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <Input type="email" placeholder="admin@coreinventory.com" required defaultValue="admin@coreinventory.com" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Password
                  </label>
                  <a href="#" className="text-xs font-semibold text-primary hover:underline">Forgot password?</a>
                </div>
                <Input type="password" required defaultValue="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground">
          Any credentials will work for this demo.
        </p>
      </div>
    </div>
  )
}
