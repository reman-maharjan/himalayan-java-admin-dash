"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Plus, Search, Layers, Package, Trash2, Edit, Loader2, RefreshCw, Eye, TrendingUp } from "lucide-react"
import { productService, type SubCategory, type ProductCategory } from "@/lib/api/products"
import { toast } from "sonner"

export default function SubcategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [subcategories, setSubcategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('')
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentSubcategory, setCurrentSubcategory] = useState<Partial<SubCategory> | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; subcategory: SubCategory | null }>({
    open: false,
    subcategory: null
  })
  const [formData, setFormData] = useState({
    name: '',
    category: ''
  })
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3) // Reduced to show pagination with fewer items

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const data = await productService.getCategories()
        setCategories(data)
        if (data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0].id)
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories')
        toast.error('Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [selectedCategory])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isDialogOpen) {
      if (currentSubcategory) {
        setFormData({
          name: currentSubcategory.name || '',
          category: currentSubcategory.category?.toString() || selectedCategory.toString()
        })
      } else {
        setFormData({
          name: '',
          category: selectedCategory.toString()
        })
      }
    }
  }, [isDialogOpen, currentSubcategory, selectedCategory])

  // Fetch subcategories when selectedCategory changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory) {
        setSubcategories([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      
      try {
        const data = await productService.getSubcategories(Number(selectedCategory))
        setSubcategories(data)
      } catch (err) {
        console.error('Error fetching subcategories:', err)
        setError('Failed to load subcategories')
        toast.error('Failed to load subcategories')
      } finally {
        setLoading(false)
      }
    }

    fetchSubcategories()
  }, [selectedCategory])

  const handleAddSubcategory = () => {
    setCurrentSubcategory(null)
    setIsDialogOpen(true)
  }

  const handleEditSubcategory = (subcategory: SubCategory) => {
    setCurrentSubcategory(subcategory)
    setIsDialogOpen(true)
  }

  const handleDeleteSubcategory = (subcategory: SubCategory) => {
    setDeleteDialog({ open: true, subcategory })
  }

  const confirmDeleteSubcategory = async () => {
    const subcategory = deleteDialog.subcategory
    if (!subcategory) return
    
    try {
      await productService.deleteSubcategory(subcategory.id)
      setSubcategories(subcategories.filter(sub => sub.id !== subcategory.id))
      toast.success('Subcategory deleted successfully')
    } catch (err) {
      console.error('Failed to delete subcategory:', err)
      toast.error('Failed to delete subcategory')
    } finally {
      setDeleteDialog({ open: false, subcategory: null })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      if (currentSubcategory?.id) {
        // Update existing subcategory
        // await productService.updateSubcategory(currentSubcategory.id, {
        //   name: formData.name,
        //   category: Number(formData.category)
        // })
        setSubcategories(subcategories.map(sub => 
          sub.id === currentSubcategory.id 
            ? { ...sub, name: formData.name, category: Number(formData.category) } 
            : sub
        ))
        toast.success('Subcategory updated successfully')
      } else {
        // Create new subcategory
        const newSubcategory = await productService.createSubcategory(
          formData.name, 
          Number(formData.category)
        )
        setSubcategories([newSubcategory, ...subcategories])
        toast.success('Subcategory created successfully')
      }
      
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving subcategory:', error)
      toast.error('Failed to save subcategory')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredSubcategories = subcategories.filter(subcategory => 
    subcategory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    categories.find(c => c.id === subcategory.category)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination calculations
  const totalPages = Math.ceil(filteredSubcategories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSubcategories = filteredSubcategories.slice(startIndex, endIndex)

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Subcategories</h1>
          <p className="text-sm text-muted-foreground">Manage product subcategories and organization</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleAddSubcategory} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Subcategory
          </Button>
          <Button variant="outline" size="icon" onClick={() => window.location.reload()}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Add/Edit Subcategory Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{currentSubcategory?.id ? 'Edit' : 'Add New'} Subcategory</DialogTitle>
              <DialogDescription>
                {currentSubcategory?.id 
                  ? 'Update the subcategory details below.' 
                  : 'Enter the details for the new subcategory.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subcategory Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., T-Shirts, Pants"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {currentSubcategory?.id ? 'Updating...' : 'Creating...'}
                  </>
                ) : currentSubcategory?.id ? 'Update Subcategory' : 'Create Subcategory'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, subcategory: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this subcategory?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The subcategory &quot;{deleteDialog.subcategory?.name}&quot; will be permanently deleted from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialog({ open: false, subcategory: null })}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSubcategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Subcategory
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sub-categories</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subcategories.length}</div>
            <p className="text-xs text-muted-foreground">
              {categories.length > 0 ? `Across ${categories.length} categories` : 'No categories found'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sub-categories</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">-</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Assigned</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">-</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">-</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Sub-categories</CardTitle>
              <CardDescription>Detailed product categorization</CardDescription>
            </div>
            <div className="mt-4 md:mt-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
                className="w-full md:w-64 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">-- Select a category --</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search sub-categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={!selectedCategory || loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading && selectedCategory ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !selectedCategory ? (
            <div className="text-center py-12 text-muted-foreground">
              <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a category</h3>
              <p>Choose a category to view its sub-categories</p>
            </div>
          ) : filteredSubcategories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No sub-categories found</h3>
              <p>No sub-categories found for the selected category and search query</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedSubcategories.map((subcategory) => (
                    <tr key={subcategory.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subcategory.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{subcategory.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {categories.find(c => c.id === subcategory.category)?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditSubcategory(subcategory)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSubcategory(subcategory)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        
        {/* Pagination */}
        {filteredSubcategories.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredSubcategories.length)} of {filteredSubcategories.length} subcategories
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
      </Card>
    </div>
  )
}