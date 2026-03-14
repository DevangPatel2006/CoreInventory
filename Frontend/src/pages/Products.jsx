import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter } from "lucide-react"

const initialProducts = [
  { id: "P001", name: "Dell XPS 15", sku: "SKU-DELL-15", category: "Electronics", unit: "pcs", stock: 120 },
  { id: "P002", name: "Ergonomic Office Chair", sku: "SKU-FURN-01", category: "Furniture", unit: "pcs", stock: 45 },
  { id: "P003", name: "Wireless Mouse", sku: "SKU-ELEC-09", category: "Electronics", unit: "pcs", stock: 350 },
  { id: "P004", name: "A4 Paper Ream", sku: "SKU-OFF-A4", category: "Office", unit: "box", stock: 850 },
  { id: "P005", name: "Mechanical Keyboard", sku: "SKU-ELEC-11", category: "Electronics", unit: "pcs", stock: 80 },
]

export default function Products() {
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddProduct = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newProduct = {
      id: `P00${products.length + 1}`,
      name: formData.get("name"),
      sku: formData.get("sku"),
      category: formData.get("category"),
      unit: formData.get("unit"),
      stock: Number(formData.get("stock"))
    }
    setProducts([newProduct, ...products])
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-sm text-muted-foreground">Manage your inventory products catalog.</p>
         </div>
         <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Product
         </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-card p-4 rounded-xl border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" /> Filter Categories
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell className="text-right font-semibold">{product.stock}</TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Product">
        <form onSubmit={handleAddProduct} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Product Name</label>
            <Input name="name" required placeholder="e.g. Wireless Mouse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">SKU</label>
              <Input name="sku" required placeholder="e.g. SKU-123" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input name="category" required placeholder="e.g. Electronics" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit</label>
              <Input name="unit" required placeholder="e.g. pcs, box" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Initial Stock</label>
              <Input type="number" name="stock" required defaultValue={0} />
            </div>
          </div>
          <div className="flex w-full justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Product</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
