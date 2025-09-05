"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { MoreHorizontal, Edit, Trash2, Eye, Plus, ShoppingCart } from "lucide-react"
import { BranchFormDialog } from "./branch-form-dialog"
import { BranchDetailsDialog } from "./branch-details-dialog"
import { BranchOrders } from "./branch-orders"
import { branchService, Branch as BranchType, BranchCreateData } from "@/lib/api/branches"

export type Branch = BranchType

// Removed status display as API Branch does not include status

export function BranchesTable() {
  const router = useRouter()
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBranchForOrders, setSelectedBranchForOrders] = useState<Branch | null>(null)

  useEffect(() => {
    const fetchBranches = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await branchService.getBranches()
        setBranches(data)
      } catch (err) {
        const error = err as Error
        setError('Failed to fetch branches. Please try again.')
        toast.error('Failed to load branches', {
          description: error.message || 'An error occurred while fetching branches.'
        })
        console.error('Error fetching branches:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBranches()
  }, [])

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch)
    setIsFormOpen(true)
  }

  const handleView = (branch: Branch) => {
    setSelectedBranch(branch)
    setIsDetailsOpen(true)
  }

  const handleDelete = (branch: Branch) => {
    setSelectedBranch(branch)
    setIsDeleteDialogOpen(true)
  }

  const handleViewOrders = (branch: Branch) => {
    setSelectedBranchForOrders(branch)
  }

  const handleSave = async (branchData: BranchCreateData, id?: number) => {
    try {
      if (id) {
        // Update existing branch
        const updatedBranch = await branchService.updateBranch(id, branchData)
        setBranches(branches.map(b => b.id === id ? updatedBranch : b))
        toast.success('Branch updated successfully')
      } else {
        // Create new branch
        const newBranch = await branchService.createBranch(branchData)
        setBranches([...branches, newBranch])
        toast.success('Branch created successfully')
      }
      setIsFormOpen(false)
      setSelectedBranch(null)
    } catch (error) {
      const err = error as Error
      console.error('Error saving branch:', err)
      toast.error('Failed to save branch', {
        description: err.message || 'An error occurred while saving the branch.'
      })
    }
  }

  const handleDeleteBranch = async () => {
    if (!selectedBranch) return
    
    try {
      setIsDeleting(true)
      await branchService.deleteBranch(selectedBranch.id)
      setBranches(branches.filter((branch) => branch.id !== selectedBranch.id))
      setIsDeleteDialogOpen(false)
      setSelectedBranch(null)
      toast.success('Branch deleted successfully')
    } catch (error) {
      const err = error as Error
      console.error('Error deleting branch:', err)
      toast.error('Failed to delete branch', {
        description: err.message || 'An error occurred while deleting the branch.'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // No status color mapping; Branch type has no status

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading branches</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setIsLoading(true)
                  const fetchBranches = async () => {
                    try {
                      const data = await branchService.getBranches()
                      setBranches(data)
                    } catch (err) {
                      const error = err as Error
                      setError('Failed to fetch branches. Please try again.')
                      toast.error('Failed to load branches', {
                        description: error.message || 'An error occurred while fetching branches.'
                      })
                      console.error('Error fetching branches:', error)
                    } finally {
                      setIsLoading(false)
                    }
                  }
                  fetchBranches()
                }}
                className="text-sm font-medium text-red-800 hover:text-red-700 focus:outline-none focus:underline transition duration-150 ease-in-out"
              >
                Try again <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Branches</h2>
          <p className="text-muted-foreground">
            Manage your branches and view their details
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedBranch(null)
            setIsFormOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Branch
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Location</TableHead>
              
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {isLoading ? 'Loading branches...' : 'No branches found. Create your first branch to get started.'}
                </TableCell>
              </TableRow>
            ) : (
              branches.map((branch) => (
                <TableRow key={branch.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {branch.name}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {branch.address}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      Lat: {branch.latitude}<br />
                      Lng: {branch.longitude}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{new Date(branch.created_at).toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(branch.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{new Date(branch.updated_at).toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(branch.updated_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => handleView(branch)}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleViewOrders(branch)}
                          className="cursor-pointer"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          View Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleEdit(branch)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 cursor-pointer"
                          onClick={() => handleDelete(branch)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BranchFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBranch(null)
          }
          setIsFormOpen(open)
        }}
        branch={selectedBranch}
        onSave={handleSave}
      />

      <BranchDetailsDialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBranch(null)
          }
          setIsDetailsOpen(open)
        }}
        branch={selectedBranch}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Branch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this branch? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBranch} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedBranchForOrders} onOpenChange={(open) => !open && setSelectedBranchForOrders(null)}>
        <DialogContent className="max-w-4xl">
          {selectedBranchForOrders && (
            <BranchOrders 
              branchId={selectedBranchForOrders.id}
              branchName={selectedBranchForOrders.name}
              onClose={() => setSelectedBranchForOrders(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}