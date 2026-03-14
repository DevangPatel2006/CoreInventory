import React from "react"
import { KPICard } from "@/components/KPICard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const chartData = [
  { name: "Electronics", stock: 400 },
  { name: "Furniture", stock: 300 },
  { name: "Office", stock: 200 },
  { name: "Kitchen", stock: 278 },
  { name: "Hardware", stock: 189 },
]

const recentActivity = [
  { id: 1, action: "Received", item: "Dell XPS 15", qty: 25, date: "2 mins ago" },
  { id: 2, action: "Shipped", item: "Ergonomic Chair", qty: 4, date: "1 hour ago" },
  { id: 3, action: "Adjustment", item: "Wireless Mouse", qty: -2, date: "3 hours ago" },
  { id: 4, action: "Low Stock", item: "A4 Paper Ream", qty: 10, date: "5 hours ago" },
  { id: 5, action: "Received", item: "Mechanical Keyboard", qty: 50, date: "1 day ago" },
]

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
         <div className="text-sm text-muted-foreground">Welcome back, Admin</div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Products" value="1,248" icon={Package} description="Active SKUs cataloged" trend={12} />
        <KPICard title="Low Stock Items" value="24" icon={AlertTriangle} description="Requires immediate attention" trend={-5} />
        <KPICard title="Pending Receipts" value="12" icon={ArrowDownToLine} description="Awaiting delivery processing" />
        <KPICard title="Pending Deliveries" value="8" icon={ArrowUpFromLine} description="Orders to be shipped" trend={8} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                     cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}}
                     contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="stock" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.action}: <span className="font-semibold">{activity.item}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.qty > 0 ? '+' : ''}{activity.qty} units
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    {activity.date}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
