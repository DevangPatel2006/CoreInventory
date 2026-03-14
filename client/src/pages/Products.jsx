import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { KPICard } from "@/components/KPICard"
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Edit3, 
  Save, 
  X,
  MoreVertical,
  ChevronRight,
  Archive
} from "lucide-react"

const initialProducts = [
  { id: "P001", name: "Dell XPS 15", sku: "SKU-DELL-15", category: "Electronics", unit: "pcs", stock: 120, minStock: 20, price: 150000 },
  { id: "P002", name: "Ergonomic Office Chair", sku: "SKU-FURN-01", category: "Furniture", unit: "pcs", stock: 45, minStock: 10, price: 12500 },
  { id: "P003", name: "Wireless Mouse", sku: "SKU-ELEC-09", category: "Electronics", unit: "pcs", stock: 350, minStock: 50, price: 1500 },
  { id: "P004", name: "A4 Paper Ream", sku: "SKU-OFF-A4", category: "Office", unit: "box", stock: 15, minStock: 100, price: 500 },
  { id: "P005", name: "Mechanical Keyboard", sku: "SKU-ELEC-11", category: "Electronics", unit: "pcs", stock: 80, minStock: 25, price: 4500 },
]

export default function Products() {
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState(0)

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalStock = products.reduce((acc, p) => acc + p.stock, 0)
  const understockCount = products.filter(p => p.stock < p.minStock).length
  const totalValue = products.reduce((acc, p) => acc + (p.stock * p.price), 0)

  const handleStartEdit = (product) => {
    setEditingId(product.id)
    setEditValue(product.stock)
  }

  const handleSaveEdit = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, stock: Number(editValue) } : p))
    setEditingId(null)
  }

  const handleAddProduct = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newProduct = {
      id: `P00${products.length + 1}`,
      name: formData.get("name"),
      sku: formData.get("sku"),
      category: formData.get("category"),
      unit: formData.get("unit"),
      stock: Number(formData.get("stock")),
      minStock: Number(formData.get("minStock") || 0),
      price: Number(formData.get("price") || 0)
    }
    setProducts([newProduct, ...products])
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Products & Stock</h1>
          <p className="text-muted-foreground font-medium text-lg italic">Master product catalog and inventory levels</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>ADD NEW PRODUCT</span>
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <KPICard 
          title="Total Stock" 
          value={totalStock.toLocaleString()} 
          icon={Package} 
          description="Units across all categories" 
          trend={12} 
        />
        <KPICard 
          title="Understock Items" 
          value={understockCount.toString()} 
          icon={AlertTriangle} 
          description="Items below minimum level" 
          trend={-5} 
        />
        <KPICard 
          title="Total Value" 
          value={`₹${(totalValue / 100000).toFixed(1)}L`} 
          icon={TrendingUp} 
          description="Inventory valuation" 
          trend={8} 
        />
      </div>

      <div className="glass p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search products by name or SKU..." 
            className="input-premium pl-12 w-full h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="h-12 px-6 rounded-xl border border-white/20 bg-white/50 text-muted-foreground hover:text-foreground hover:bg-white transition-all flex items-center space-x-2 font-semibold">
          <Filter className="h-4 w-4" />
          <span>Categories</span>
        </button>
      </div>

      <div className="antigravity-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/30">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Product</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">SKU / Category</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Price</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right px-10">Stock Count</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-primary/5 transition-colors group">
                <td className="px-6 py-5">
                   <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-muted-foreground">
                        <Archive className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-lg">{p.name}</div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">{p.id}</div>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-5">
                   <div className="font-bold text-primary font-mono text-sm">{p.sku}</div>
                   <div className="text-xs font-black text-muted-foreground uppercase mt-1 tracking-wider">{p.category}</div>
                </td>
                <td className="px-6 py-5 text-right font-black text-foreground">
                   ₹{p.price.toLocaleString()}
                </td>
                <td className="px-6 py-5 text-right">
                   <div className="flex items-center justify-end space-x-3">
                      {editingId === p.id ? (
                        <div className="flex items-center space-x-2 animate-in slide-in-from-right-2">
                           <input 
                              type="number" 
                              autoFocus
                              value={editValue} 
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-24 h-10 text-right bg-white border border-primary/30 rounded-lg pr-3 font-black text-primary outline-none" 
                           />
                           <button onClick={() => handleSaveEdit(p.id)} className="p-2 bg-primary text-white rounded-lg hover:shadow-lg transition-all"><Save className="h-4 w-4" /></button>
                           <button onClick={() => setEditingId(null)} className="p-2 bg-gray-100 text-muted-foreground rounded-lg hover:bg-white transition-all"><X className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <div onClick={() => handleStartEdit(p)} className={`flex items-center space-x-3 cursor-pointer p-2 rounded-xl transition-all hover:bg-white ${p.stock < p.minStock ? 'bg-destructive/10 text-destructive' : 'text-foreground'}`}>
                           <span className="text-xl font-black">{p.stock}</span>
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{p.unit}</span>
                           <Edit3 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                   </div>
                </td>
                <td className="px-6 py-5 text-right">
                   <button className="p-2 hover:bg-white rounded-lg transition-all text-muted-foreground"><MoreVertical className="h-5 w-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl antigravity-card p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black text-foreground tracking-tight">Add New Product</h2>
                  <p className="text-muted-foreground font-medium italic">Create a new item in your inventory</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
                  <X className="h-6 w-6 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Product Name</label>
                  <input name="name" required placeholder="e.g. Wireless Mouse" className="input-premium w-full h-14 text-lg font-bold" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">SKU Number</label>
                    <input name="sku" required placeholder="SKU-123" className="input-premium w-full h-12 font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Category</label>
                    <select name="category" className="input-premium w-full h-12 font-bold appearance-none bg-white">
                      <option>Electronics</option>
                      <option>Furniture</option>
                      <option>Office</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Unit</label>
                    <input name="unit" required defaultValue="pcs" className="input-premium w-full h-12 font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Unit Price (₹)</label>
                    <input name="price" type="number" required placeholder="0" className="input-premium w-full h-12 font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Initial Stock</label>
                    <input name="stock" type="number" required defaultValue="0" className="input-premium w-full h-12 font-bold" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 h-14 rounded-2xl font-black text-muted-foreground uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel</button>
                  <button type="submit" className="btn-primary h-14 px-10">CREATE PRODUCT</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

