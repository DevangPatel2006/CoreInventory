import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Truck, Search, SendHorizontal } from "lucide-react"

const initialDeliveries = [
  { id: "DLV-001", date: "2023-10-26", destination: "Warehouse East", status: "Shipped", driver: "John Doe" },
  { id: "DLV-002", date: "2023-10-26", destination: "Store #42", status: "Preparing", driver: "Pending" },
]

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState(initialDeliveries)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreateDelivery = (e) => {
    e.preventDefault()
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Deliveries</h1>
            <p className="text-sm text-muted-foreground">Manage outgoing shipments and deliveries.</p>
         </div>
         <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <Truck className="mr-2 h-4 w-4" /> New Delivery
         </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search delivery ID or destination..." className="pl-9 bg-background" />
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Delivery ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell className="font-medium text-primary hover:underline cursor-pointer">{delivery.id}</TableCell>
                <TableCell>{delivery.date}</TableCell>
                <TableCell>{delivery.destination}</TableCell>
                <TableCell>{delivery.driver}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${delivery.status === 'Shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                     {delivery.status === 'Shipped' && <SendHorizontal className="w-3 h-3 mr-1" />}
                     {delivery.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Delivery">
        <form onSubmit={handleCreateDelivery} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination</label>
            <Input required placeholder="Customer or Location Name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Product to Ship</label>
            <Input required placeholder="Scan product or enter SKU" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <Input type="number" required min="1" defaultValue="1" />
          </div>
          <div className="flex w-full justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Delivery</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
