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
import { MoreHorizontal, Check, X, Eye, Gift } from "lucide-react"
import { RedemptionDetailsDialog } from "./redemption-details-dialog"

export interface RedemptionRequest {
  id: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
    avatar?: string
    totalPoints: number
  }
  reward: {
    id: string
    name: string
    pointsRequired: number
    category: string
    description: string
  }
  pointsUsed: number
  status: "pending" | "approved" | "rejected" | "completed"
  requestDate: string
  processedDate?: string
  processedBy?: string
  branch: string
  notes?: string
}

const mockRedemptionRequests: RedemptionRequest[] = [
  {
    id: "1",
    customer: {
      id: "1",
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+977-9841234567",
      totalPoints: 1245,
    },
    reward: {
      id: "1",
      name: "Free Coffee",
      pointsRequired: 500,
      category: "Beverages",
      description: "Any regular coffee drink",
    },
    pointsUsed: 500,
    status: "pending",
    requestDate: "2024-03-02T10:30:00Z",
    branch: "Thamel Branch",
    notes: "Customer prefers Himalayan Blend",
  },
  {
    id: "2",
    customer: {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+977-9851234567",
      totalPoints: 890,
    },
    reward: {
      id: "2",
      name: "Free Pastry",
      pointsRequired: 300,
      category: "Food",
      description: "Any pastry from our selection",
    },
    pointsUsed: 300,
    status: "approved",
    requestDate: "2024-03-02T09:15:00Z",
    processedDate: "2024-03-02T09:30:00Z",
    processedBy: "Admin User",
    branch: "Durbar Marg Branch",
  },
  {
    id: "3",
    customer: {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      phone: "+977-9861234567",
      totalPoints: 2100,
    },
    reward: {
      id: "3",
      name: "10% Discount",
      pointsRequired: 200,
      category: "Discounts",
      description: "10% off on next purchase",
    },
    pointsUsed: 200,
    status: "completed",
    requestDate: "2024-03-01T14:20:00Z",
    processedDate: "2024-03-01T14:25:00Z",
    processedBy: "Branch Manager",
    branch: "Patan Branch",
  },
  {
    id: "4",
    customer: {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      phone: "+977-9871234567",
      totalPoints: 230,
    },
    reward: {
      id: "4",
      name: "Free Sandwich",
      pointsRequired: 800,
      category: "Food",
      description: "Any sandwich from our menu",
    },
    pointsUsed: 800,
    status: "rejected",
    requestDate: "2024-03-01T11:45:00Z",
    processedDate: "2024-03-01T12:00:00Z",
    processedBy: "Admin User",
    branch: "Thamel Branch",
    notes: "Insufficient points available",
  },
]

export function RedemptionRequestsTable() {
  const [requests, setRequests] = useState<RedemptionRequest[]>(mockRedemptionRequests)
  const [selectedRequest, setSelectedRequest] = useState<RedemptionRequest | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const handleViewDetails = (request: RedemptionRequest) => {
    setSelectedRequest(request)
    setIsDetailsDialogOpen(true)
  }

  const handleApprove = (requestId: string) => {
    setRequests(
      requests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: "approved",
              processedDate: new Date().toISOString(),
              processedBy: "Admin User",
            }
          : request,
      ),
    )
  }

  const handleReject = (requestId: string) => {
    setRequests(
      requests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: "rejected",
              processedDate: new Date().toISOString(),
              processedBy: "Admin User",
            }
          : request,
      ),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
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
              <TableHead>Customer</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Request Date</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={request.customer.avatar || "/placeholder.svg"} alt={request.customer.name} />
                      <AvatarFallback>
                        {request.customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{request.customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {request.customer.totalPoints} points available
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-accent/10 flex items-center justify-center">
                      <Gift className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <div className="font-medium">{request.reward.name}</div>
                      <div className="text-sm text-muted-foreground">{request.reward.category}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{request.pointsUsed}</div>
                  <div className="text-sm text-muted-foreground">Required: {request.reward.pointsRequired}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{request.branch}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(request.requestDate)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewDetails(request)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {request.status === "pending" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleApprove(request.id)} className="text-green-600">
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReject(request.id)} className="text-red-600">
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RedemptionDetailsDialog
        request={selectedRequest}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
    </>
  )
}
