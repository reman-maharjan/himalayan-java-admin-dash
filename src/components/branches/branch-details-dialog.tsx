"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  Armchair,
  Wifi,
  Car,
  Truck,
  DollarSign,
  ShoppingCart,
  Star,
  TrendingUp,
} from "lucide-react"
import type { Branch } from "./branches-table"

interface BranchDetailsDialogProps {
  branch: Branch | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BranchDetailsDialog({ branch, open, onOpenChange }: BranchDetailsDialogProps) {
  if (!branch) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {branch.name} - Branch Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Branch Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{branch.name}</CardTitle>
                  <CardDescription>
                    {branch.address}, {branch.city}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className={getStatusColor(branch.status)}>
                  {branch.status}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Contact & Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Contact & Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{branch.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{branch.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Manager: {branch.manager}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  Hours: {branch.openingHours.open} - {branch.openingHours.close}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(branch.monthlyRevenue)}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{branch.monthlyOrders}</div>
                <p className="text-xs text-muted-foreground">Orders processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-1">
                  {branch.averageRating}
                  <span className="text-yellow-500">★</span>
                </div>
                <p className="text-xs text-muted-foreground">Customer rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Capacity & Staff */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Armchair className="h-4 w-4" />
                Capacity & Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Staff Count</div>
                  <div className="text-2xl font-bold">{branch.staffCount}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Seating Capacity</div>
                  <div className="text-2xl font-bold">{branch.seatingCapacity}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities & Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`flex items-center gap-2 p-3 rounded-md ${branch.hasWifi ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}
                >
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm font-medium">WiFi</span>
                </div>
                <div
                  className={`flex items-center gap-2 p-3 rounded-md ${branch.hasParking ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}
                >
                  <Car className="h-4 w-4" />
                  <span className="text-sm font-medium">Parking</span>
                </div>
                <div
                  className={`flex items-center gap-2 p-3 rounded-md ${branch.hasDelivery ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}
                >
                  <Truck className="h-4 w-4" />
                  <span className="text-sm font-medium">Delivery</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Recent Performance
              </CardTitle>
              <CardDescription>Last 7 days overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Daily Average Revenue</span>
                  <span className="font-medium">{formatCurrency(Math.round(branch.monthlyRevenue / 30))}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm">Daily Average Orders</span>
                  <span className="font-medium">{Math.round(branch.monthlyOrders / 30)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm">Revenue per Order</span>
                  <span className="font-medium">
                    {branch.monthlyOrders > 0
                      ? formatCurrency(Math.round(branch.monthlyRevenue / branch.monthlyOrders))
                      : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
