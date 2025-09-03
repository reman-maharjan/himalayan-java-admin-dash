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
import { MoreHorizontal, Edit, Trash2, Eye, Mail, Phone } from "lucide-react"
import { UserFormDialog } from "./user-form-dialog"
import { UserDetailsDialog } from "./user-details-dialog"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: "customer" | "staff" | "admin"
  status: "active" | "inactive" | "suspended"
  joinDate: string
  lastLogin: string
  totalOrders: number
  totalSpent: number
  loyaltyPoints: number
  avatar?: string
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+977-9841234567",
    role: "customer",
    status: "active",
    joinDate: "2024-01-15",
    lastLogin: "2024-03-01",
    totalOrders: 23,
    totalSpent: 12450,
    loyaltyPoints: 1245,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+977-9851234567",
    role: "customer",
    status: "active",
    joinDate: "2024-02-20",
    lastLogin: "2024-03-02",
    totalOrders: 15,
    totalSpent: 8900,
    loyaltyPoints: 890,
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@himalayanjava.com",
    phone: "+977-9861234567",
    role: "staff",
    status: "active",
    joinDate: "2023-11-10",
    lastLogin: "2024-03-02",
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@email.com",
    phone: "+977-9871234567",
    role: "customer",
    status: "suspended",
    joinDate: "2024-01-05",
    lastLogin: "2024-02-28",
    totalOrders: 5,
    totalSpent: 2300,
    loyaltyPoints: 230,
  },
  {
    id: "5",
    name: "Admin User",
    email: "admin@himalayanjava.com",
    phone: "+977-9881234567",
    role: "admin",
    status: "active",
    joinDate: "2023-01-01",
    lastLogin: "2024-03-02",
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
  },
]

export function UsersTable() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleView = (user: User) => {
    setSelectedUser(user)
    setIsDetailsDialogOpen(true)
  }

  const handleDelete = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId))
  }

  const handleSaveUser = (userData: Partial<User>) => {
    if (selectedUser) {
      // Edit existing user
      setUsers(users.map((user) => (user.id === selectedUser.id ? { ...user, ...userData } : user)))
    } else {
      // Add new user
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        role: userData.role || "customer",
        status: userData.status || "active",
        joinDate: new Date().toISOString().split("T")[0],
        lastLogin: "Never",
        totalOrders: 0,
        totalSpent: 0,
        loyaltyPoints: 0,
      }
      setUsers([...users, newUser])
    }
    setSelectedUser(null)
    setIsEditDialogOpen(false)
    setIsAddDialogOpen(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "staff":
        return "bg-blue-100 text-blue-800"
      case "customer":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Loyalty Points</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {user.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.totalOrders}</TableCell>
                <TableCell>Rs. {user.totalSpent.toLocaleString()}</TableCell>
                <TableCell>{user.loyaltyPoints}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleView(user)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserFormDialog
        user={selectedUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveUser}
      />

      <UserFormDialog user={null} open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSave={handleSaveUser} />

      <UserDetailsDialog user={selectedUser} open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen} />

      {/* Export the add dialog trigger */}
      <Button onClick={() => setIsAddDialogOpen(true)} className="hidden" id="add-user-trigger">
        Add User
      </Button>
    </>
  )
}
