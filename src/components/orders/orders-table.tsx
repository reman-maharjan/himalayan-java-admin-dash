"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Eye, Edit, Printer, MapPin, Clock } from "lucide-react"
import { OrderDetailsDialog } from "./order-details-dialog"
import { OrderStatusDialog } from "./order-status-dialog"

export interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: number
  total: number
}

export interface Order {
  id: string
  orderNumber: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
    avatar?: string
  }
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: "pending" | "processing" | "ready" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentMethod: "cash" | "card" | "digital_wallet" | "loyalty_points"
  branch: string
  orderType: "dine_in" | "takeaway" | "delivery"
  createdAt: string
  updatedAt: string
  estimatedTime?: string
  notes?: string
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "HJ-2024-001",
    customer: {
      id: "1",
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+977-9841234567",
    },
    items: [
      { id: "1", productName: "Himalayan Blend Coffee", quantity: 2, price: 250, total: 500 },
      { id: "2", productName: "Croissant", quantity: 1, price: 120, total: 120 },
    ],
    subtotal: 620,
    tax: 80.6,
    discount: 0,
    total: 700.6,
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "card",
    branch: "Thamel Branch",
    orderType: "dine_in",
    createdAt: "2024-03-02T10:30:00Z",
    updatedAt: "2024-03-02T11:15:00Z",
    estimatedTime: "15 mins",
  },
  {
    id: "2",
    orderNumber: "HJ-2024-002",
    customer: {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+977-9851234567",
    },
    items: [
      { id: "3", productName: "Espresso", quantity: 1, price: 180, total: 180 },
      { id: "4", productName: "Club Sandwich", quantity: 1, price: 350, total: 350 },
    ],
    subtotal: 530,
    tax: 68.9,
    discount: 50,
    total: 548.9,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "digital_wallet",
    branch: "Durbar Marg Branch",
    orderType: "takeaway",
    createdAt: "2024-03-02T11:45:00Z",
    updatedAt: "2024-03-02T11:50:00Z",
    estimatedTime: "20 mins",
  },
  {
    id: "3",
    orderNumber: "HJ-2024-003",
    customer: {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      phone: "+977-9861234567",
    },
    items: [{ id: "5", productName: "Green Tea", quantity: 2, price: 200, total: 400 }],
    subtotal: 400,
    tax: 52,
    discount: 0,
    total: 452,
    status: "ready",
    paymentStatus: "paid",
    paymentMethod: "cash",
    branch: "Patan Branch",
    orderType: "takeaway",
    createdAt: "2024-03-02T12:15:00Z",
    updatedAt: "2024-03-02T12:25:00Z",
    estimatedTime: "5 mins",
  },
  {
    id: "4",
    orderNumber: "HJ-2024-004",
    customer: {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      phone: "+977-9871234567",
    },
    items: [
      { id: "6", productName: "Himalayan Blend Coffee", quantity: 1, price: 250, total: 250 },
      { id: "7", productName: "Croissant", quantity: 2, price: 120, total: 240 },
    ],
    subtotal: 490,
    tax: 63.7,
    discount: 25,
    total: 528.7,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "card",
    branch: "Thamel Branch",
    orderType: "delivery",
    createdAt: "2024-03-02T12:30:00Z",
    updatedAt: "2024-03-02T12:30:00Z",
    estimatedTime: "30 mins",
  },
  {
    id: "5",
    orderNumber: "HJ-2024-005",
    customer: {
      id: "5",
      name: "David Brown",
      email: "david.brown@email.com",
      phone: "+977-9881234567",
    },
    items: [{ id: "8", productName: "Espresso", quantity: 3, price: 180, total: 540 }],
    subtotal: 540,
    tax: 70.2,
    discount: 0,
    total: 610.2,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "card",
    branch: "Durbar Marg Branch",
    orderType: "dine_in",
    createdAt: "2024-03-02T09:15:00Z",
    updatedAt: "2024-03-02T09:45:00Z",
  },
]

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsDialogOpen(true)
  }

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order)
    setIsStatusDialogOpen(true)
  }

  const handleStatusUpdate = (orderId: string, newStatus: Order["status"], paymentStatus?: Order["paymentStatus"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              paymentStatus: paymentStatus || order.paymentStatus,
              updatedAt: new Date().toISOString(),
            }
          : order,
      ),
    )
    setIsStatusDialogOpen(false)
    setSelectedOrder(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case "dine_in":
        return "🍽️"
      case "takeaway":
        return "🥡"
      case "delivery":
        return "🚚"
      default:
        return "📦"
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getOrderTypeIcon(order.orderType)}</div>
                    <div>
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {order.estimatedTime || "N/A"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={order.customer.avatar || "/placeholder.svg"} alt={order.customer.name} />
                      <AvatarFallback>
                        {order.customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-sm text-muted-foreground">{order.customer.phone}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.items.length} items</div>
                    <div className="text-sm text-muted-foreground">
                      {order.items
                        .slice(0, 2)
                        .map((item) => item.productName)
                        .join(", ")}
                      {order.items.length > 2 && "..."}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">Rs. {order.total.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">{order.paymentMethod.replace("_", " ")}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(order.status)}>
                    {order.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    {order.branch}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{formatTime(order.createdAt)}</div>
                    <div className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(order)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Update Status
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Receipt
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <OrderDetailsDialog order={selectedOrder} open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen} />

      <OrderStatusDialog
        order={selectedOrder}
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  )
}
