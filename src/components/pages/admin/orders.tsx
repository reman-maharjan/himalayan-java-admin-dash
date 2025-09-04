"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, Download, ShoppingCart, Clock, CheckCircle, TrendingUp, DollarSign, Loader2 } from "lucide-react"
import { orderService } from "@/lib/api/orders"
import { Order, OrderStatus } from "@/types/orderType"

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    revenue: 0
  })

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching orders...');
        const data = await orderService.getOrders();
        console.log('Orders fetched successfully:', data);
        
        setOrders(data);
        
        // Calculate statistics
        const today = new Date().toISOString().split('T')[0];
        const todayRevenue = data
          .filter(order => order.status === 'completed' && order.created_at?.startsWith(today))
          .reduce((sum, order) => sum + (order.total_price || 0), 0);

        setStats({
          total: data.length,
          pending: data.filter(o => o.status === 'pending').length,
          processing: data.filter(o => o.status === 'processing').length,
          completed: data.filter(o => o.status === 'completed').length,
          revenue: todayRevenue
        });
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setError(
          error instanceof Error 
            ? error.message 
            : 'Failed to load orders. Please check your connection and try again.'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         order.id?.toString().includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesBranch = branchFilter === 'all' || order.branch?.toString() === branchFilter
    
    return matchesSearch && matchesStatus && matchesBranch
  })

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
    } catch (error) {
      console.error('Failed to update order status:', error)
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to update order status. Please check your connection and try again.'
      );
    }
  }

  if (loading) {
    return error ? (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {error}
            </h3>
            {error.includes('401') && (
              <div className="mt-2 text-sm text-red-700">
                <p>You need to be logged in to view orders.</p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="mt-2 font-medium text-red-700 underline hover:text-red-600"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading orders...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Track and manage all customer orders</p>
        </div>
        <Button variant="outline" disabled>
          <Download className="mr-2 h-4 w-4" />
          Export Orders
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">Being prepared</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Successfully fulfilled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Today's total revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Manage and track all customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="1">Thamel Branch</SelectItem>
                  <SelectItem value="2">Durbar Marg Branch</SelectItem>
                  <SelectItem value="3">Patan Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md">
            <div className="w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Order #</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Customer</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Items</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Total</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Date</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">#{order.id}</td>
                      <td className="p-4 align-middle">{order.customer_name || 'Guest'}</td>
                      <td className="p-4 align-middle">
                        {order.items?.slice(0, 2).map((item, i) => (
                          <div key={i} className="text-sm text-muted-foreground">
                            {item.quantity}x {item.name || `Product ${item.product}`}
                          </div>
                        ))}
                        {order.items && order.items.length > 2 && (
                          <div className="text-sm text-muted-foreground">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right align-middle font-medium">
                        Rs. {Number(order.total_price || 0).toFixed(2)}
                      </td>
                      <td className="p-4 align-middle">
                        <Select 
                          value={order.status} 
                          onValueChange={(value) => handleStatusChange(order.id!, value as OrderStatus)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 text-right align-middle text-sm text-muted-foreground">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-right align-middle">
                        <Button variant="ghost" size="sm" className="h-8">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredOrders.length === 0 && (
              <div className="flex items-center justify-center p-8 text-center">
                <div className="grid gap-1">
                  <p className="text-sm text-muted-foreground">No orders found</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


