import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Package, ArrowRight, Mail, Lock, User, AtSign, Eye, EyeOff } from "lucide-react"

export default function Login() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    loginId: "",
    email: "",
    password: "",
    rePassword: ""
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!isLogin) {
      if (form.loginId.length < 6 || form.loginId.length > 12) {
        newErrors.loginId = "Login ID must be 6-12 characters"
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = "Enter a valid email address"
      }
      if (form.password.length <= 8) {
        newErrors.password = "Password must be > 8 characters"
      } else if (!/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password) || !/[!@#$%^&*]/.test(form.password)) {
        newErrors.password = "Must contain lowercase, uppercase, and special char"
      }
      if (form.password !== form.rePassword) {
        newErrors.rePassword = "Passwords do not match"
      }
    } else {
      if (form.loginId !== "admin" || form.password !== "password") {
        newErrors.auth = "Invalid Login Id or Password"
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate("/")
    }, 1000)
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex w-1/2 bg-primary relative items-center justify-center p-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-600" />
        {/* Animated Background Shapes */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 blur-[100px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/10 blur-[80px] rounded-full" 
        />

        <div className="relative z-10 text-white space-y-8 max-w-lg">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-24 w-24 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl shadow-black/10"
          >
            <Package className="h-12 w-12 text-white" />
          </motion.div>
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-6xl font-black tracking-tight leading-tight"
            >
              CoreInventory <br />
              <span className="text-white/60">System.</span>
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/70 font-medium"
            >
              Next-generation, enterprise-grade inventory management with Antigravity precision.
            </motion.p>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-10 flex items-center space-x-6 border-t border-white/10"
          >
            <div className="flex -space-x-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-12 w-12 rounded-full border-4 border-primary bg-white/10 backdrop-blur-md" />
              ))}
            </div>
            <p className="text-sm font-semibold tracking-wide text-white/80">Trusted by over 500+ global enterprises.</p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-md space-y-10 relative z-10">
          <div className="space-y-2">
            <motion.div
              key={isLogin ? "login-title" : "signup-title"}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                {isLogin ? "Sign In" : "Create Account"}
              </h2>
              <p className="text-muted-foreground font-medium">
                {isLogin ? "Welcome back! Enter your details below." : "Join CoreInventory today and start scaling."}
              </p>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login-fields" : "signup-fields"}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="space-y-4"
              >
                {errors.auth && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl text-sm font-semibold flex items-center animate-shake">
                    {errors.auth}
                  </div>
                )}

                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Enter Login Id"
                    className={`input-premium pl-12 w-full h-14 font-medium transition-all ${errors.loginId ? 'border-destructive/50 ring-2 ring-destructive/10' : ''}`}
                    value={form.loginId}
                    onChange={(e) => setForm({...form, loginId: e.target.value})}
                  />
                  {errors.loginId && <p className="text-xs text-destructive mt-1.5 ml-1 font-semibold">{errors.loginId}</p>}
                </div>

                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="relative group"
                  >
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="email"
                      placeholder="Enter Email Id"
                      className={`input-premium pl-12 w-full h-14 font-medium transition-all ${errors.email ? 'border-destructive/50 ring-2 ring-destructive/10' : ''}`}
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                    />
                    {errors.email && <p className="text-xs text-destructive mt-1.5 ml-1 font-semibold">{errors.email}</p>}
                  </motion.div>
                )}

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    className={`input-premium pl-12 pr-12 w-full h-14 font-medium transition-all ${errors.password ? 'border-destructive/50 ring-2 ring-destructive/10' : ''}`}
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  {errors.password && <p className="text-xs text-destructive mt-1.5 ml-1 font-semibold">{errors.password}</p>}
                </div>

                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="relative group"
                  >
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="password"
                      placeholder="Re-Enter Password"
                      className={`input-premium pl-12 w-full h-14 font-medium transition-all ${errors.rePassword ? 'border-destructive/50 ring-2 ring-destructive/10' : ''}`}
                      value={form.rePassword}
                      onChange={(e) => setForm({...form, rePassword: e.target.value})}
                    />
                    {errors.rePassword && <p className="text-xs text-destructive mt-1.5 ml-1 font-semibold">{errors.rePassword}</p>}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary" />
                <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-sm font-bold text-primary hover:underline underline-offset-4 decoration-2">Forget Password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:bg-primary/50"
            >
              {loading ? (
                <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-widest">{isLogin ? "Sign In" : "Sign Up"}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-8 border-t border-gray-100 mt-10">
            <p className="text-muted-foreground font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary font-bold hover:underline underline-offset-4 decoration-2"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

