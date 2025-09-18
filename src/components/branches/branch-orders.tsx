"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { orderService } from "@/lib/api/orders"
import { OrderResponse, OrderStatus } from "@/types/orderType"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface BranchOrdersProps {
  branchId: number
  branchName: string
  onClose: () => void
}

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
}

export function BranchOrders({ branchId, branchName, onClose }: BranchOrdersProps) {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log(`[BranchOrders] Fetching orders for branch ID: ${branchId}`);
        setIsLoading(true);
        setError(null);
        
        // Log current auth status
        const token = localStorage.getItem('authToken');
        console.log('[BranchOrders] Auth token exists:', !!token);
        
        const data = await orderService.getOrdersByBranch(branchId);
        console.log('[BranchOrders] Received orders data:', data);
        
        if (!data) {
          console.warn('[BranchOrders] No data received from getOrdersByBranch');
          setOrders([]);
          return;
        }
        
        const ordersArray = Array.isArray(data) ? data : [];
        console.log(`[BranchOrders] Setting ${ordersArray.length} orders`);
        setOrders(ordersArray);
        
        if (ordersArray.length === 0) {
          console.log('[BranchOrders] No orders found for branch. This might be expected if the branch has no orders.');
        }
      } catch (err) {
        const error = err as Error;
        const errorMessage = error.message || 'An unknown error occurred while fetching orders.';
        
        console.error('[BranchOrders] Error details:', {
          error: error.toString(),
          branchId,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
        
        setError('Failed to fetch orders. Please check your connection and try again.');
        
        toast.error('Failed to load orders', {
          description: errorMessage,
          action: {
            label: 'Retry',
            onClick: () => fetchOrders()
          }
        });
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [branchId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getStatusBadge = (status: OrderStatus) => {
    return (
      <Badge className={statusColors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Orders for {branchName}</h3>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No orders found for this branch.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{getStatusBadge(order.order_status)}</TableCell>
                  <TableCell>Rs. {Number(order.total_price).toFixed(2)}</TableCell>
                  <TableCell>{order.items.length} items</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
