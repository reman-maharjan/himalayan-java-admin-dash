"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MapPin,
} from "lucide-react"
import type { Branch } from "@/lib/api/branches"

interface BranchDetailsDialogProps {
  branch: Branch | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BranchDetailsDialog({ branch, open, onOpenChange }: BranchDetailsDialogProps) {
  if (!branch) return null

  const formatDateTime = (value?: string) => {
    if (!value) return "-"
    try {
      const d = new Date(value)
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
    } catch {
      return value
    }
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
          {/* Branch Header */
          }
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{branch.name}</CardTitle>
                  <CardDescription>
                    {branch.address}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Latitude</div>
                  <div className="font-medium">{branch.latitude}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Longitude</div>
                  <div className="font-medium">{branch.longitude}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Created At</div>
                  <div className="font-medium">{formatDateTime(branch.created_at)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Updated At</div>
                  <div className="font-medium">{formatDateTime(branch.updated_at)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </DialogContent>
    </Dialog>
  )
}
