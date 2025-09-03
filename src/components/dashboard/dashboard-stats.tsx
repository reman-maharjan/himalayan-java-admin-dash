import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, ShoppingCart, MapPin, TrendingUp, Coffee } from "lucide-react"

const stats = [
  {
    title: "Total Users",
    value: "2,847",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Products",
    value: "156",
    change: "+3%",
    changeType: "positive" as const,
    icon: Package,
  },
  {
    title: "Orders Today",
    value: "89",
    change: "+23%",
    changeType: "positive" as const,
    icon: ShoppingCart,
  },
  {
    title: "Active Branches",
    value: "12",
    change: "0%",
    changeType: "neutral" as const,
    icon: MapPin,
  },
  {
    title: "Revenue Today",
    value: "Rs. 45,230",
    change: "+18%",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
  {
    title: "Coffee Sold",
    value: "234",
    change: "+15%",
    changeType: "positive" as const,
    icon: Coffee,
  },
]

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p
              className={`text-xs ${
                stat.changeType === "positive"
                  ? "text-green-600"
                  : stat.changeType === "neutral"
                    ? "text-muted-foreground"
                    : "text-red-600"
              }`}
            >
              {stat.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
