"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Gift, User, Calendar, MapPin, Phone, Mail, FileText } from "lucide-react"
import type { RedemptionRequest } from "./redemption-requests-table"

interface RedemptionDetailsDialogProps {
  request: RedemptionRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RedemptionDetailsDialog({ request, open, onOpenChange }: RedemptionDetailsDialogProps) {
  if (!request) return null

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Redemption Request Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Request #{request.id}</CardTitle>
                  <CardDescription>{request.branch}</CardDescription>
                </div>
                <Badge variant="secondary" className={getStatusColor(request.status)}>
                  {request.status}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.customer.avatar || "/placeholder.svg"} alt={request.customer.name} />
                  <AvatarFallback className="text-lg">
                    {request.customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{request.customer.name}</h3>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {request.customer.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {request.customer.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Gift className="h-3 w-3" />
                      <span className="font-medium">{request.customer.totalPoints} points available</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reward Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Reward Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-lg">{request.reward.name}</div>
                  <div className="text-sm text-muted-foreground">{request.reward.category}</div>
                </div>
                <div className="text-sm">{request.reward.description}</div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm">Points Required</span>
                  <span className="font-medium">{request.reward.pointsRequired}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Points Used</span>
                  <span className="font-medium">{request.pointsUsed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Remaining Points</span>
                  <span className="font-medium">{request.customer.totalPoints - request.pointsUsed}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Request Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Request Submitted</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(request.requestDate).toLocaleString()}
                    </div>
                  </div>
                </div>
                {request.processedDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {request.status === "approved"
                          ? "Approved"
                          : request.status === "rejected"
                            ? "Rejected"
                            : "Processed"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(request.processedDate).toLocaleString()}
                        {request.processedBy && ` by ${request.processedBy}`}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Branch Location</div>
                    <div className="text-sm text-muted-foreground">{request.branch}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {request.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{request.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
