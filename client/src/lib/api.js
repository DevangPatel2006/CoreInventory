const BASE_URL = "http://localhost:5000"

function getToken() {
  return localStorage.getItem("ci_token")
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    localStorage.removeItem("ci_token")
    localStorage.removeItem("ci_user")
    window.location.href = "/login"
    return
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Request failed")
  return data
}

// Auth
export const authApi = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (name, email, password) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  forgotPassword: (email) =>
    request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (email, otp, new_password) =>
    request("/auth/reset-password", { method: "POST", body: JSON.stringify({ email, otp, new_password }) }),
}

// Dashboard
export const dashboardApi = {
  kpis: () => request("/dashboard/kpis"),
  activity: () => request("/dashboard/activity"),
}

// Products
export const productsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/products${q ? `?${q}` : ""}`)
  },
  get: (id) => request(`/products/${id}`),
  getStock: (id) => request(`/products/${id}/stock`),
  create: (data) => request("/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deactivate: (id) => request(`/products/${id}/deactivate`, { method: "PATCH" }),
}

// Categories
export const categoriesApi = {
  list: () => request("/categories"),
}

// Warehouses
export const warehousesApi = {
  list: () => request("/warehouses"),
  create: (data) => request("/warehouses", { method: "POST", body: JSON.stringify(data) }),
}

// Receipts
export const receiptsApi = {
  list: () => request("/receipts"),
  get: (id) => request(`/receipts/${id}`),
  create: (data) => request("/receipts", { method: "POST", body: JSON.stringify(data) }),
  validate: (id) => request(`/receipts/${id}/validate`, { method: "POST" }),
  updateStatus: (id, status) =>
    request(`/receipts/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
}

// Deliveries
export const deliveriesApi = {
  list: () => request("/deliveries"),
  get: (id) => request(`/deliveries/${id}`),
  create: (data) => request("/deliveries", { method: "POST", body: JSON.stringify(data) }),
  validate: (id) => request(`/deliveries/${id}/validate`, { method: "POST" }),
  updateStatus: (id, status) =>
    request(`/deliveries/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
}

// Move History
export const movesApi = {
  list: () => request("/moves"),
}

// Adjustments
export const adjustmentsApi = {
  create: (data) => request("/adjustments", { method: "POST", body: JSON.stringify(data) }),
}

// Transfers
export const transfersApi = {
  list: () => request("/transfers"),
  get: (id) => request(`/transfers/${id}`),
  create: (data) => request("/transfers", { method: "POST", body: JSON.stringify(data) }),
  validate: (id) => request(`/transfers/${id}/validate`, { method: "POST" }),
}
