"use client"

import { useState, useEffect } from "react"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { toast } from "sonner"
import { MoreHorizontal, Edit, Trash2, Eye, Plus, ShoppingCart } from "lucide-react"
import { BranchFormDialog } from "./branch-form-dialog"
import { BranchDetailsDialog } from "./branch-details-dialog"
import { BranchOrders } from "./branch-orders"
import { branchService, Branch as BranchType, BranchCreateData } from "@/lib/api/branches"

export type Branch = BranchType

interface BranchesTableProps {
  searchQuery?: string
  statusFilter?: string
  cityFilter?: string
}

export function BranchesTable({ searchQuery, statusFilter, cityFilter }: BranchesTableProps) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; branch: Branch | null }>({
    open: false,
    branch: null
  })
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false)
  const [selectedBranchForOrders, setSelectedBranchForOrders] = useState<Branch | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3) // Reduced to show pagination with fewer items

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
    setIsEditConfirmOpen(true)
  }

  const handleView = (branch: Branch) => {
    setSelectedBranch(branch)
    setIsDetailsOpen(true)
  }

  const handleDelete = (branch: Branch) => {
    setDeleteDialog({ open: true, branch })
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

  const confirmDeleteBranch = async () => {
    const branch = deleteDialog.branch
    if (!branch) return
    
    try {
      setIsDeleting(true)
      await branchService.deleteBranch(branch.id)
      setBranches(branches.filter((b) => b.id !== branch.id))
      toast.success('Branch deleted successfully')
    } catch (error) {
      const err = error as Error
      console.error('Error deleting branch:', err)
      toast.error('Failed to delete branch', {
        description: err.message || 'An error occurred while deleting the branch.'
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialog({ open: false, branch: null })
    }
  }

  const handleConfirmEdit = () => {
    if (selectedBranch) {
      setIsEditConfirmOpen(false)
      setIsFormOpen(true)
    }
  }

  // Filter branches based on search and filter criteria
  const filteredBranches = branches.filter(branch => {
    const matchesSearch = !searchQuery || 
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Since the API Branch doesn't have status, we'll skip status filtering for now
    // You can add status filtering when your API supports it
    
    return matchesSearch
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBranches = filteredBranches.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, cityFilter])

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
            {paginatedBranches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {isLoading ? 'Loading branches...' : searchQuery ? 'No branches match your search criteria.' : 'No branches found. Create your first branch to get started.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedBranches.map((branch) => (
                <TableRow key={branch.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {branch.name}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {branch.address}
                  </TableCell>
                  <TableCell>
                    {branch.latitude && branch.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View on Map
                      </a>
                    ) : (
                      <span className="text-muted-foreground">No location data</span>
                    )}
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

      {/* Pagination */}
      {filteredBranches.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredBranches.length)} of {filteredBranches.length} branches
          </div>
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(page)
                      }}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

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

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, branch: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this branch?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The branch &quot;{deleteDialog.branch?.name}&quot; at &quot;{deleteDialog.branch?.address}&quot; will be permanently deleted from the system.
              <span className="block mt-2 font-medium text-destructive">
                Warning: All data associated with this branch will be permanently removed.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialog({ open: false, branch: null })}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteBranch} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Branch'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditConfirmOpen} onOpenChange={setIsEditConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>
              You are about to edit {selectedBranch?.name}. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmEdit}>
              Continue
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