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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Branch } from "./branches-table"

interface BranchFormDialogProps {
  branch: Branch | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (branchData: Partial<Branch>) => void
}

export function BranchFormDialog({ branch, open, onOpenChange, onSave }: BranchFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    manager: "",
    status: "active" as Branch["status"],
    openingHours: {
      open: "07:00",
      close: "21:00",
    },
    staffCount: 0,
    seatingCapacity: 0,
    hasWifi: false,
    hasParking: false,
    hasDelivery: false,
  })

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name,
        address: branch.address,
        city: branch.city,
        phone: branch.phone,
        email: branch.email,
        manager: branch.manager,
        status: branch.status,
        openingHours: branch.openingHours,
        staffCount: branch.staffCount,
        seatingCapacity: branch.seatingCapacity,
        hasWifi: branch.hasWifi,
        hasParking: branch.hasParking,
        hasDelivery: branch.hasDelivery,
      })
    } else {
      setFormData({
        name: "",
        address: "",
        city: "",
        phone: "",
        email: "",
        manager: "",
        status: "active" as Branch["status"],
        openingHours: {
          open: "07:00",
          close: "21:00",
        },
        staffCount: 0,
        seatingCapacity: 0,
        hasWifi: false,
        hasParking: false,
        hasDelivery: false,
      })
    }
  }, [branch, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{branch ? "Edit Branch" : "Add New Branch"}</DialogTitle>
          <DialogDescription>
            {branch ? "Update branch information below." : "Fill in the details to create a new branch."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Branch Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter branch name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter city"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter full address"
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+977-1-4700123"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="branch@himalayanjava.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="manager">Branch Manager</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  placeholder="Manager name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive" | "maintenance") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="openTime">Opening Time</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={formData.openingHours.open}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      openingHours: { ...formData.openingHours, open: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="closeTime">Closing Time</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={formData.openingHours.close}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      openingHours: { ...formData.openingHours, close: e.target.value },
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="staffCount">Staff Count</Label>
                <Input
                  id="staffCount"
                  type="number"
                  value={formData.staffCount}
                  onChange={(e) => setFormData({ ...formData, staffCount: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="seatingCapacity">Seating Capacity</Label>
                <Input
                  id="seatingCapacity"
                  type="number"
                  value={formData.seatingCapacity}
                  onChange={(e) => setFormData({ ...formData, seatingCapacity: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4">
              <Label>Amenities</Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasWifi"
                    checked={formData.hasWifi}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasWifi: !!checked })}
                  />
                  <Label htmlFor="hasWifi">WiFi Available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasParking"
                    checked={formData.hasParking}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasParking: !!checked })}
                  />
                  <Label htmlFor="hasParking">Parking Available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDelivery"
                    checked={formData.hasDelivery}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasDelivery: !!checked })}
                  />
                  <Label htmlFor="hasDelivery">Delivery Service</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{branch ? "Update Branch" : "Create Branch"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
