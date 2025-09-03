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
import { MoreHorizontal, Edit, Trash2, Eye, MapPin, Phone, Users, Clock } from "lucide-react"
import { BranchFormDialog } from "./branch-form-dialog"
import { BranchDetailsDialog } from "./branch-details-dialog"

export interface Branch {
  id: string
  name: string
  address: string
  city: string
  phone: string
  email: string
  manager: string
  status: "active" | "inactive" | "maintenance"
  openingHours: {
    open: string
    close: string
  }
  staffCount: number
  seatingCapacity: number
  hasWifi: boolean
  hasParking: boolean
  hasDelivery: boolean
  monthlyRevenue: number
  monthlyOrders: number
  averageRating: number
  createdAt: string
  updatedAt: string
}

const mockBranches: Branch[] = [
  {
    id: "1",
    name: "Thamel Branch",
    address: "Thamel Marg, Kathmandu",
    city: "Kathmandu",
    phone: "+977-1-4700123",
    email: "thamel@himalayanjava.com",
    manager: "Rajesh Shrestha",
    status: "active",
    openingHours: {
      open: "06:00",
      close: "22:00",
    },
    staffCount: 12,
    seatingCapacity: 45,
    hasWifi: true,
    hasParking: false,
    hasDelivery: true,
    monthlyRevenue: 850000,
    monthlyOrders: 1250,
    averageRating: 4.5,
    createdAt: "2023-01-15",
    updatedAt: "2024-02-20",
  },
  {
    id: "2",
    name: "Durbar Marg Branch",
    address: "Durbar Marg, Kathmandu",
    city: "Kathmandu",
    phone: "+977-1-4700124",
    email: "durbarmarg@himalayanjava.com",
    manager: "Sita Gurung",
    status: "active",
    openingHours: {
      open: "07:00",
      close: "21:00",
    },
    staffCount: 15,
    seatingCapacity: 60,
    hasWifi: true,
    hasParking: true,
    hasDelivery: true,
    monthlyRevenue: 1200000,
    monthlyOrders: 1800,
    averageRating: 4.7,
    createdAt: "2023-02-10",
    updatedAt: "2024-02-18",
  },
  {
    id: "3",
    name: "Patan Branch",
    address: "Lagankhel, Patan",
    city: "Lalitpur",
    phone: "+977-1-4700125",
    email: "patan@himalayanjava.com",
    manager: "Amit Maharjan",
    status: "active",
    openingHours: {
      open: "06:30",
      close: "21:30",
    },
    staffCount: 10,
    seatingCapacity: 35,
    hasWifi: true,
    hasParking: true,
    hasDelivery: false,
    monthlyRevenue: 650000,
    monthlyOrders: 950,
    averageRating: 4.3,
    createdAt: "2023-03-05",
    updatedAt: "2024-02-25",
  },
  {
    id: "4",
    name: "Pokhara Branch",
    address: "Lakeside, Pokhara",
    city: "Pokhara",
    phone: "+977-61-700126",
    email: "pokhara@himalayanjava.com",
    manager: "Krishna Thapa",
    status: "active",
    openingHours: {
      open: "07:00",
      close: "22:00",
    },
    staffCount: 8,
    seatingCapacity: 40,
    hasWifi: true,
    hasParking: false,
    hasDelivery: true,
    monthlyRevenue: 720000,
    monthlyOrders: 1100,
    averageRating: 4.6,
    createdAt: "2023-06-20",
    updatedAt: "2024-02-22",
  },
  {
    id: "5",
    name: "Bhaktapur Branch",
    address: "Durbar Square, Bhaktapur",
    city: "Bhaktapur",
    phone: "+977-1-4700127",
    email: "bhaktapur@himalayanjava.com",
    manager: "Maya Shrestha",
    status: "maintenance",
    openingHours: {
      open: "08:00",
      close: "20:00",
    },
    staffCount: 6,
    seatingCapacity: 25,
    hasWifi: true,
    hasParking: false,
    hasDelivery: false,
    monthlyRevenue: 0,
    monthlyOrders: 0,
    averageRating: 4.2,
    createdAt: "2023-08-15",
    updatedAt: "2024-03-01",
  },
]

export function BranchesTable() {
  const [branches, setBranches] = useState<Branch[]>(mockBranches)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch)
    setIsEditDialogOpen(true)
  }

  const handleView = (branch: Branch) => {
    setSelectedBranch(branch)
    setIsDetailsDialogOpen(true)
  }

  const handleDelete = (branchId: string, branchName: string) => {
    if (window.confirm(`Are you sure you want to delete the branch "${branchName}"? This action cannot be undone.`)) {
      try {
        setBranches(branches.filter((branch) => branch.id !== branchId));
        // In a real app, you would also make an API call here
        // await deleteBranch(branchId);
      } catch (error) {
        console.error('Failed to delete branch:', error);
        // In a real app, show a toast/notification to the user
        alert('Failed to delete branch. Please try again.');
      }
    }
  }

  const handleSaveBranch = (branchData: Partial<Branch>) => {
    // Validate required fields
    const requiredFields = ['name', 'address', 'city', 'phone', 'email', 'manager'] as const;
    const missingFields = requiredFields.filter(field => !branchData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      if (selectedBranch) {
        // Edit existing branch
        setBranches(
          branches.map((branch) =>
            branch.id === selectedBranch.id
              ? { 
                  ...branch, 
                  ...branchData, 
                  updatedAt: new Date().toISOString().split("T")[0] 
                } as Branch
              : branch,
          ),
        )
      } else {
        // Add new branch
        const newBranch: Branch = {
          id: Date.now().toString(),
          name: branchData.name!,
          address: branchData.address!,
          city: branchData.city!,
          phone: branchData.phone!,
          email: branchData.email!,
          manager: branchData.manager!,
          status: branchData.status || "active",
          openingHours: branchData.openingHours || { open: "07:00", close: "21:00" },
          staffCount: branchData.staffCount || 0,
          seatingCapacity: branchData.seatingCapacity || 0,
          hasWifi: branchData.hasWifi || false,
          hasParking: branchData.hasParking || false,
          hasDelivery: branchData.hasDelivery || false,
          monthlyRevenue: 0,
          monthlyOrders: 0,
          averageRating: 0,
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
        }
        setBranches([...branches, newBranch]);
      }
      setSelectedBranch(null);
      setIsEditDialogOpen(false);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to save branch:', error);
      alert('Failed to save branch. Please try again.');
    }
  }

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
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Branch</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{branch.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {branch.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">{branch.city}</div>
                    <div className="text-xs text-muted-foreground max-w-[150px] truncate">{branch.address}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Phone className="h-3 w-3" />
                      {branch.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{branch.manager}</div>
                  <div className="text-sm text-muted-foreground">{branch.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(branch.status)}>
                    {branch.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{branch.staffCount}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{branch.seatingCapacity} seats</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {branch.openingHours.open} - {branch.openingHours.close}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{formatCurrency(branch.monthlyRevenue)}</div>
                  <div className="text-xs text-muted-foreground">{branch.monthlyOrders} orders</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{branch.averageRating}</span>
                    <span className="text-yellow-500">★</span>
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
                      <DropdownMenuItem onClick={() => handleView(branch)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(branch)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Branch
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(branch.id, branch.name);
                        }} 
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Branch
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BranchFormDialog
        branch={selectedBranch}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveBranch}
      />

      <BranchFormDialog
        branch={null}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleSaveBranch}
      />

      <BranchDetailsDialog branch={selectedBranch} open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen} />

      {/* Export the add dialog trigger */}
      <Button 
        onClick={() => setIsAddDialogOpen(true)} 
        className="sr-only" 
        id="add-branch-trigger"
        aria-label="Add new branch"
      >
        Add Branch
      </Button>
    </>
  )
}
