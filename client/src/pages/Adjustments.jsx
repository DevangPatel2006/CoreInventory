import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileEdit, Check, X } from "lucide-react"

export default function Adjustments() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Adjustments</h1>
            <p className="text-sm text-muted-foreground">Adjust stock levels due to damage, loss, or count mismatch.</p>
         </div>
         <Button>
            <FileEdit className="mr-2 h-4 w-4" /> New Adjustment
         </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Adjustments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground py-8 text-center italic">
            No stock adjustments made in the last 30 days. Your physical counts match exactly!
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
