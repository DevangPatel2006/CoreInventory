import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeftRight, Search } from "lucide-react"

export default function Transfers() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col justify-center items-center h-64 border-2 border-dashed rounded-xl border-muted bg-muted/20 text-center">
         <ArrowLeftRight className="h-10 w-10 text-muted-foreground mb-4" />
         <h2 className="text-xl font-semibold">Warehouse Transfers</h2>
         <p className="text-muted-foreground mt-2 max-w-sm">
           Move stock intelligently between warehouses. This module is active but currently disabled until multiple warehouses are configured in settings.
         </p>
         <Button className="mt-6" variant="outline">Configure Warehouses</Button>
      </div>
    </div>
  )
}
