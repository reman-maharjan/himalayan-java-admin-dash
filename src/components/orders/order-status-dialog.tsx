"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Order } from "./orders-table"

interface OrderStatusDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdate: (orderId: string, status: Order["status"], paymentStatus?: Order["paymentStatus"]) => void
}

const statusOptions = [
  { value: "pending", label: "Pending", description: "Order received, waiting to be processed" },
  { value: "processing", label: "Processing", description: "Order is being prepared" },
  { value: "ready", label: "Ready", description: "Order is ready for pickup/delivery" },
  { value: "completed", label: "Completed", description: "Order has been fulfilled" },
  { value: "cancelled", label: "Cancelled", description: "Order has been cancelled" },
]

const paymentStatusOptions = [
  { value: "pending", label: "Pending", description: "Payment not yet received" },
  { value: "paid", label: "Paid", description: "Payment completed successfully" },
  { value: "failed", label: "Failed", description: "Payment attempt failed" },
  { value: "refunded", label: "Refunded", description: "Payment has been refunded" },
]

export function OrderStatusDialog({ order, open, onOpenChange, onStatusUpdate }: OrderStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<Order["status"]>("pending")
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<Order["paymentStatus"]>("pending")

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status)
      setSelectedPaymentStatus(order.paymentStatus)
    }
  }, [order, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (order) {
      onStatusUpdate(order.id, selectedStatus, selectedPaymentStatus)
    }
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

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>Update the status for order {order.orderNumber}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Current Status Display */}
            <div className="grid gap-2">
              <Label>Current Status</Label>
              <div className="flex gap-2">
                <Badge variant="secondary" className={getStatusColor(order.status)}>
                  {order.status.replace("_", " ")}
                </Badge>
                <Badge variant="secondary" className={getPaymentStatusColor(order.paymentStatus)}>
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Order Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Order Status</Label>
              <Select value={selectedStatus} onValueChange={(value: Order["status"]) => setSelectedStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select order status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status */}
            <div className="grid gap-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select
                value={selectedPaymentStatus}
                onValueChange={(value: Order["paymentStatus"]) => setSelectedPaymentStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview New Status */}
            <div className="grid gap-2">
              <Label>New Status Preview</Label>
              <div className="flex gap-2">
                <Badge variant="secondary" className={getStatusColor(selectedStatus)}>
                  {selectedStatus.replace("_", " ")}
                </Badge>
                <Badge variant="secondary" className={getPaymentStatusColor(selectedPaymentStatus)}>
                  {selectedPaymentStatus}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Status</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
