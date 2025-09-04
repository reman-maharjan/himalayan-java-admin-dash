"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Loader2, AlertCircle, RefreshCw, Tags, Package, TrendingUp } from "lucide-react"
import { productService } from "@/lib/api/products"
import { toast } from "sonner"

interface Category {
  id: number
  name: string
  product_count?: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

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
    document.getElementById("add-category-trigger")?.click()
  }

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    
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
        <Button onClick={handleAddCategory} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
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
        <Button variant="outline" size="icon" className="shrink-0" onClick={fetchCategories}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
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
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {category.product_count || 0} products
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => console.log('Edit:', category.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
