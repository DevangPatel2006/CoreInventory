import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Package, ArrowRight, Mail, Lock, User, Eye, EyeOff, KeyRound, RefreshCw } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { authApi } from "../lib/api"

const MODES = { LOGIN: "login", REGISTER: "register", FORGOT: "forgot", RESET: "reset" }

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [mode, setMode] = useState(MODES.LOGIN)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState("")
  const [apiSuccess, setApiSuccess] = useState("")

  const [form, setForm] = useState({
    name: "", email: "", password: "", rePassword: "", otp: "", newPassword: ""
  })
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: "" }))
    setApiError("")
  }

  const validate = () => {
    const errs = {}
    if (mode === MODES.LOGIN) {
      if (!form.email) errs.email = "Email is required"
      if (!form.password) errs.password = "Password is required"
    }
    if (mode === MODES.REGISTER) {
      if (!form.name) errs.name = "Full name is required"
      if (!form.email) errs.email = "Email is required"
      if (form.password.length < 8) errs.password = "Min 8 characters"
      else if (!/[A-Z]/.test(form.password)) errs.password = "Must contain uppercase"
      else if (!/[a-z]/.test(form.password)) errs.password = "Must contain lowercase"
      else if (!/[!@#$%^&*]/.test(form.password)) errs.password = "Must contain special char (!@#$%^&*)"
      if (form.password !== form.rePassword) errs.rePassword = "Passwords do not match"
    }
    if (mode === MODES.FORGOT) {
      if (!form.email) errs.email = "Email is required"
    }
    if (mode === MODES.RESET) {
      if (!form.otp) errs.otp = "OTP is required"
      if (!form.newPassword) errs.newPassword = "New password is required"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError("")
    setApiSuccess("")
    try {
      if (mode === MODES.LOGIN) {
        await login(form.email, form.password)
        navigate("/", { replace: true })
      } else if (mode === MODES.REGISTER) {
        await authApi.register(form.name, form.email, form.password)
        setApiSuccess("Account created! Please login.")
        setMode(MODES.LOGIN)
      } else if (mode === MODES.FORGOT) {
        const res = await authApi.forgotPassword(form.email)
        setApiSuccess(res.message || "Check your email for OTP.")
        // In dev mode the OTP may be returned
        if (res.otp) setApiSuccess(`Dev OTP: ${res.otp}`)
        setMode(MODES.RESET)
      } else if (mode === MODES.RESET) {
        await authApi.resetPassword(form.email, form.otp, form.newPassword)
        setApiSuccess("Password reset! Please login.")
        setMode(MODES.LOGIN)
      }
    } catch (err) {
      setApiError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const modeTitle = {
    [MODES.LOGIN]: "Welcome back",
    [MODES.REGISTER]: "Create account",
    [MODES.FORGOT]: "Reset password",
    [MODES.RESET]: "Enter OTP",
  }

  const modeSubtitle = {
    [MODES.LOGIN]: "Sign in to CoreInventory",
    [MODES.REGISTER]: "Start managing your inventory",
    [MODES.FORGOT]: "We'll send an OTP to your email",
    [MODES.RESET]: "Enter the code we sent you",
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex w-1/2 bg-primary relative items-center justify-center p-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-600" />
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-3xl" />
        <div className="relative z-10 text-white space-y-8 max-w-lg">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Package className="h-9 w-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">CoreInventory</h1>
              <p className="text-white/60 font-semibold uppercase tracking-widest text-xs">Enterprise Edition</p>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-black leading-tight">The future of stock management.</h2>
            <p className="text-white/60 text-lg font-medium leading-relaxed">
              Realtime receipts, deliveries, stock levels, and audit logs — all in one glassmorphic dashboard.
            </p>
          </div>
          {["End-to-end inventory tracking", "Real-time stock validation", "Audit-ready move history"].map(f => (
            <div key={f} className="flex items-center space-x-3">
              <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
              <span className="text-white/80 font-semibold">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center">
                <Package className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-black text-foreground">CoreInventory</span>
            </div>
            <h2 className="text-4xl font-black text-foreground tracking-tight">{modeTitle[mode]}</h2>
            <p className="text-muted-foreground font-medium mt-2 italic">{modeSubtitle[mode]}</p>
          </div>

          <AnimatePresence mode="wait">
            {apiError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="px-5 py-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold">
                {apiError}
              </motion.div>
            )}
            {apiSuccess && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="px-5 py-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold">
                {apiSuccess}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === MODES.REGISTER && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input value={form.name} onChange={set("name")} placeholder="John Smith"
                    className={`input-premium w-full h-14 pl-12 text-base font-bold border ${errors.name ? "border-destructive" : ""}`} />
                </div>
                {errors.name && <p className="text-destructive text-xs font-bold">{errors.name}</p>}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input type="email" value={form.email} onChange={set("email")} placeholder="you@company.com"
                  className={`input-premium w-full h-14 pl-12 text-base font-bold border ${errors.email ? "border-destructive" : ""}`} />
              </div>
              {errors.email && <p className="text-destructive text-xs font-bold">{errors.email}</p>}
            </div>

            {(mode === MODES.LOGIN || mode === MODES.REGISTER) && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="••••••••"
                    className={`input-premium w-full h-14 pl-12 pr-12 text-base font-bold border ${errors.password ? "border-destructive" : ""}`} />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-xs font-bold">{errors.password}</p>}
              </div>
            )}

            {mode === MODES.REGISTER && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input type="password" value={form.rePassword} onChange={set("rePassword")} placeholder="••••••••"
                    className={`input-premium w-full h-14 pl-12 text-base font-bold border ${errors.rePassword ? "border-destructive" : ""}`} />
                </div>
                {errors.rePassword && <p className="text-destructive text-xs font-bold">{errors.rePassword}</p>}
              </div>
            )}

            {mode === MODES.RESET && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">OTP Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input value={form.otp} onChange={set("otp")} placeholder="123456"
                      className={`input-premium w-full h-14 pl-12 text-base font-black tracking-widest border ${errors.otp ? "border-destructive" : ""}`} />
                  </div>
                  {errors.otp && <p className="text-destructive text-xs font-bold">{errors.otp}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input type="password" value={form.newPassword} onChange={set("newPassword")} placeholder="••••••••"
                      className={`input-premium w-full h-14 pl-12 text-base font-bold border ${errors.newPassword ? "border-destructive" : ""}`} />
                  </div>
                  {errors.newPassword && <p className="text-destructive text-xs font-bold">{errors.newPassword}</p>}
                </div>
              </>
            )}

            {mode === MODES.LOGIN && (
              <div className="text-right">
                <button type="button" onClick={() => { setMode(MODES.FORGOT); setApiError(""); setApiSuccess("") }}
                  className="text-xs font-black text-primary hover:underline uppercase tracking-widest">
                  Forgot Password?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full h-14 text-sm flex items-center justify-center space-x-2 disabled:opacity-60">
              {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : (
                <>
                  <span>
                    {mode === MODES.LOGIN ? "SIGN IN" :
                     mode === MODES.REGISTER ? "CREATE ACCOUNT" :
                     mode === MODES.FORGOT ? "SEND OTP" : "RESET PASSWORD"}
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center space-y-3">
            {mode === MODES.LOGIN && (
              <p className="text-sm text-muted-foreground font-medium">
                Don't have an account?{" "}
                <button onClick={() => { setMode(MODES.REGISTER); setApiError(""); setApiSuccess("") }}
                  className="text-primary font-black hover:underline">Create one</button>
              </p>
            )}
            {mode !== MODES.LOGIN && (
              <button onClick={() => { setMode(MODES.LOGIN); setApiError(""); setApiSuccess("") }}
                className="text-sm font-black text-muted-foreground hover:text-primary transition-colors">
                ← Back to Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
