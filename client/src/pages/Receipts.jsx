import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, CheckCircle2 } from "lucide-react"

const initialReceipts = [
  { id: "RC-001", date: "2023-10-24", supplier: "TechCorp Global", status: "Completed", items: 25, totalValue: "$24,500" },
  { id: "RC-002", date: "2023-10-25", supplier: "OfficeSupplies Inc", status: "Pending", items: 400, totalValue: "$1,200" },
]

export default function Receipts() {
  const [receipts, setReceipts] = useState(initialReceipts)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddReceipt = (e) => {
    e.preventDefault()
    setIsModalOpen(false)
    // Add logic goes here
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Receipts</h1>
            <p className="text-sm text-muted-foreground">Manage incoming stock and purchase orders.</p>
         </div>
         <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> New Receipt
         </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search receipt ID or supplier..." className="pl-9 bg-background" />
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell className="font-medium text-primary cursor-pointer hover:underline">{receipt.id}</TableCell>
                <TableCell>{receipt.date}</TableCell>
                <TableCell>{receipt.supplier}</TableCell>
                <TableCell>{receipt.items}</TableCell>
                <TableCell>{receipt.totalValue}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${receipt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                     {receipt.status === 'Completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                     {receipt.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Receipt">
        <form onSubmit={handleAddReceipt} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Supplier Name</label>
            <Input required placeholder="e.g. Acme Corp" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Product ID or Name</label>
            <Input required placeholder="Scan or type..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity Received</label>
              <Input type="number" required min="1" defaultValue="1" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit Cost</label>
              <Input type="number" step="0.01" />
            </div>
          </div>
          <div className="flex w-full justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Receipt</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
