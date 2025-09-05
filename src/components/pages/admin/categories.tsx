"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Loader2, AlertCircle, RefreshCw, Tags, Package, TrendingUp, Trash2, Edit } from "lucide-react"
import { productService } from "@/lib/api/products"
import { toast } from "sonner"

export interface Category {
  id: number
  name: string
  description?: string
  status?: 'active' | 'inactive'
  product_count?: number
}

interface ProductCategory {
  id: number
  name: string
  description?: string
  product_count?: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<(Category | ProductCategory)[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Partial<Category & ProductCategory> | null>(null)
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    status: 'active' | 'inactive';
  }>({
    name: '',
    description: '',
    status: 'active'
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active'
    })
    setCurrentCategory(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (currentCategory?.id) {
        // Update existing category
        // await productService.updateCategory(currentCategory.id, formData)
        setCategories(categories.map(cat => 
          cat.id === currentCategory.id ? { ...cat, ...formData } : cat
        ))
        toast.success('Category updated successfully')
      } else {
        // Create new category
        const newCategory = await productService.createCategory(formData.name, formData.description)
        setCategories([newCategory, ...categories])
        toast.success('Category created successfully')
      }
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Failed to save category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching categories...')
      const data = await productService.getCategories()
      console.log('Received categories data:', data)
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array of categories')
      }
      setCategories(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories'
      console.error('Error in fetchCategories:', {
        error: err,
        message: errorMessage,
        timestamp: new Date().toISOString()
      })
      setError(errorMessage)
      toast.error(errorMessage, {
        description: 'Check the console for more details',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleAddCategory = () => {
    resetForm()
    setCurrentCategory(null)
    setIsDialogOpen(true)
  }

  const handleEditCategory = (category: Category | ProductCategory) => {
    setCurrentCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      status: 'status' in category ? category.status || 'active' : 'active'
    })
    setIsDialogOpen(true)
  }

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    const response = await productService.deleteCategory(id)
    try {

      // TODO: Add delete category API call when available
      // await productService.deleteCategory(id)
      setCategories(categories.filter(category => category.id !== id))
      toast.success('Category deleted successfully')
    } catch (err) {
      console.error('Failed to delete category:', err)
      toast.error('Failed to delete category')
    }
  }

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Categories</h1>
          <p className="text-sm text-muted-foreground">Manage product categories and organization</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleAddCategory} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
          <Button variant="outline" size="icon" onClick={fetchCategories} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle className="text-xl">Categories</CardTitle>
              <CardDescription className="text-sm">
                {filteredCategories.length} categor{filteredCategories.length === 1 ? 'y' : 'ies'} found
                {searchQuery ? ' (filtered)' : ''}
              </CardDescription>
            </div>
            {!loading && filteredCategories.length > 0 && (
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={fetchCategories}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading categories...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-destructive">{error}</p>
                <Button variant="outline" onClick={fetchCategories}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Tags className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No categories found</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? 'No categories match your search criteria.'
                  : 'Get started by adding your first category.'}
              </p>
              <Button onClick={handleAddCategory}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {category.product_count || 0} {category.product_count === 1 ? 'product' : 'products'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditCategory(category)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCategory(category.id)
                          }}
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
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{currentCategory?.id ? 'Edit' : 'Add New'} Category</DialogTitle>
              <DialogDescription>
                {currentCategory?.id 
                  ? 'Update the category details below.' 
                  : 'Enter the details for the new category.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Electronics, Clothing"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Optional description for the category"
                  rows={3}
                />
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
                    {currentCategory?.id ? 'Updating...' : 'Creating...'}
                  </>
                ) : currentCategory?.id ? 'Update Category' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
