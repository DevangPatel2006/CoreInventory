import React from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"

const logs = [
  { id: "LOG-004", date: "2023-10-26 14:32", type: "Delivery (Shipped)", product: "Ergonomic Office Chair", qty: -4, user: "Admin" },
  { id: "LOG-003", date: "2023-10-26 09:15", type: "Adjustment", product: "Wireless Mouse", qty: -2, user: "System" },
  { id: "LOG-002", date: "2023-10-25 11:20", type: "Receipt", product: "A4 Paper Ream", qty: 400, user: "Admin" },
  { id: "LOG-001", date: "2023-10-24 16:45", type: "Receipt", product: "Dell XPS 15", qty: 25, user: "Admin" },
]

export default function MoveHistory() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Move History</h1>
            <p className="text-sm text-muted-foreground">Audit log of all inventory movements across the system.</p>
         </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search product, type, or user..." className="pl-9 bg-background" />
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Log ID</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Quantity Change</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-muted-foreground text-xs font-mono">{log.id}</TableCell>
                <TableCell>{log.date}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    log.type.includes('Receipt') ? 'bg-emerald-100 text-emerald-700' :
                    log.type.includes('Delivery') ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {log.type}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{log.product}</TableCell>
                <TableCell className={`text-right font-medium ${log.qty > 0 ? "text-emerald-600" : "text-destructive"}`}>
                  {log.qty > 0 ? "+" : ""}{log.qty}
                </TableCell>
                <TableCell>{log.user}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
