"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ProductsTable } from "@/components/products/products-table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Plus, Search, Filter, Loader2, RefreshCw, AlertCircle, Package, AlertTriangle } from "lucide-react"
import { productService, type Product as ApiProduct, type ProductCategory, type SubCategory } from "@/lib/api/products"
import { toast } from "sonner"
import { ProductFormDialog } from "@/components/products/product-form-dialog"
import { Product as TableProduct } from "@/components/products/products-table"

// Create a mapped type that converts between API and Table product types
type Product = Omit<ApiProduct, 'id'> & {
  id: string; // Changed to string to match TableProduct
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
  // Additional fields for the table
  category: string; // Made required to match TableProduct
  subcategory: string | number;
  cost: number;
  stock: number;
  image_url: string | null;
  image_alt: string | null;
  points_required: number;
  // Required fields from ApiProduct
  name: string;
  description: string;
  price: number;
  sub_category: number;
  is_featured: boolean;
  image: string | null;
  image_alt_description: string | null;
  redeem_points: number;
  featured_points: number;
  size: { id: number; name: string }[];
  add_ons: { id: number; name: string; price: number }[];
}

// Helper function to convert API product to TableProduct
const toTableProduct = (product: any, categories: ProductCategory[], subcategories: SubCategory[]): Product => {
  // Find the subcategory to get the category ID
  const subcategory = subcategories.find(sub => sub.id === product.sub_category);
  // Find the category name using the subcategory's category ID
  const category = categories.find(cat => cat.id === subcategory?.category);
  
  return {
    ...product,
    id: String(product.id),
    status: (product.status as 'active' | 'inactive' | 'out_of_stock') || 'inactive',
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
    category: category?.name || '',
    subcategory: subcategory?.name || '',
    cost: product.cost || 0,
    stock: product.stock || 0,
    image_url: product.image || product.image_url || null,
    image_alt: product.image_alt_description || product.image_alt || '',
    points_required: product.points_required || 0,
    name: product.name || '',
    description: product.description || '',
    price: product.price || 0,
    sub_category: product.sub_category || 0,
    is_featured: product.is_featured || false,
    image: product.image || null,
    image_alt_description: product.image_alt_description || null,
    redeem_points: product.redeem_points || 0,
    featured_points: product.featured_points || 0,
    size: product.size || [],
    add_ons: product.add_ons || []
  };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [subcategories, setSubcategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3) // Reduced to show pagination with fewer items

  // Apply filters and search
  const applyFilters = useCallback((
    productsList: Product[], 
    query: string, 
    category: string, 
    status: string
  ) => {
    let result = [...productsList]
    
    // Apply search query
    if (query) {
      const searchLower = query.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        (p.description && p.description.toLowerCase().includes(searchLower))
      )
    }
    
    // Apply category filter - Fixed to filter by subcategory properly
    if (category !== 'all') {
      result = result.filter(product => 
        product.sub_category === parseInt(category)
      )
    }
    
    // Apply status filter
    if (status === 'featured') {
      result = result.filter(product => product.is_featured)
    } else if (status === 'regular') {
      result = result.filter(product => !product.is_featured)
    }
    
    setFilteredProducts(result)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching data...');
      
      const [productsResponse, categoriesResponse, subcategoriesResponse] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
        productService.getSubcategories()
      ]);
      
      console.log('Categories fetched:', categoriesResponse);
      console.log('Subcategories fetched:', subcategoriesResponse);
      
      let productsData = productsResponse.map(product => toTableProduct(product, categoriesResponse, subcategoriesResponse));
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      setCategories(categoriesResponse);
      setSubcategories(subcategoriesResponse);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    applyFilters(products, searchQuery, categoryFilter, statusFilter);
  }, [products, searchQuery, categoryFilter, statusFilter, applyFilters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, statusFilter])

  // Event handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    applyFilters(products, value, categoryFilter, statusFilter);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    applyFilters(products, searchQuery, value, statusFilter);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    applyFilters(products, searchQuery, categoryFilter, value);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData().finally(() => setIsRefreshing(false));
  };

  const handleAddProduct = () => {
    console.log('Opening add product dialog');
    console.log('Available categories:', categories);
    console.log('Available subcategories:', subcategories);
    setIsAddDialogOpen(true);
  };

  const handleEditProduct = (product: TableProduct) => {
    console.log('Editing product:', product);
    // Convert TableProduct to API Product format with all required fields
    const productToEdit: Product = {
      ...product,
      // Required fields from TableProduct
      id: product.id,
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      status: product.status || 'inactive',
      // Category and subcategory
      category: product.category || '',
      subcategory: product.subcategory || 0,
      // Dates
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: product.updatedAt || new Date().toISOString(),
      // Product details with defaults
      sub_category: typeof product.subcategory === 'string' ? parseInt(product.subcategory) : (product.subcategory || 0),
      is_featured: product.status === 'active',
      image: product.image || null,
      image_alt_description: product.image_alt || '',
      redeem_points: 0,
      featured_points: 0,
      size: [],
      add_ons: [],
      // Additional required fields from Product type
      cost: product.cost || 0,
      stock: product.stock || 0,
      image_url: product.image || null,
      image_alt: product.image_alt || null,
      points_required: product.points_required || 0
    };
    setSelectedProduct(productToEdit);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(parseInt(id))
        setProducts(prev => prev.filter(p => p.id !== id))
        setFilteredProducts(prev => prev.filter(p => p.id !== id))
        toast.success('Product deleted successfully')
      } catch (err) {
        console.error('Failed to delete product:', err)
        toast.error('Failed to delete product')
      }
    }
  }

  const handleSaveProduct = async (data: Partial<TableProduct>, isNew: boolean) => {
    try {
      console.log('Saving product data:', data);
      
      // Convert form data to API Product format
      const productData: Omit<ApiProduct, 'id'> = {
        name: data.name || '',
        description: data.description || '',
        price: data.price || 0,
        sub_category: data.subcategory ? 
          (typeof data.subcategory === 'string' ? parseInt(data.subcategory) : data.subcategory) : 
          (subcategories.length > 0 ? subcategories[0].id : 1), // Use first available subcategory as fallback
        is_featured: data.status === 'active',
        image: data.image || null,
        image_alt_description: data.description || '',
        redeem_points: 0, // Default value
        featured_points: 0, // Default value
        size: [], // Default empty array
        add_ons: [] // Default empty array
      };
      
      console.log('Converted product data for API:', productData);
      
      if (isNew) {
        // Create new product
        const newProduct = await productService.createProduct(productData);
        console.log('Created product response:', newProduct);
        
        // Map the API response to our Product type
        const mappedProduct = toTableProduct(newProduct, categories, subcategories);
        
        setProducts(prev => [...prev, mappedProduct]);
        setFilteredProducts(prev => [...prev, mappedProduct]);
        toast.success('Product created successfully');
        setIsAddDialogOpen(false);
      } else if (selectedProduct?.id) {
        // Update existing product
        const updatedProduct = await productService.updateProduct(
          parseInt(selectedProduct.id), // Convert back to number for the API
          productData
        );
        
        // Map the API response to our Product type
        const mappedProduct = toTableProduct(updatedProduct, categories, subcategories);
        
        setProducts(prev => prev.map(p => p.id === selectedProduct.id ? mappedProduct : p));
        setFilteredProducts(prev => prev.map(p => p.id === selectedProduct.id ? mappedProduct : p));
        toast.success('Product updated successfully');
        setIsEditDialogOpen(false);
      }  
      setSelectedProduct(null)
    } catch (err) {
      console.error('Failed to save product:', err)
      toast.error(`Failed to ${isNew ? 'create' : 'update'} product`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-sm text-muted-foreground">
            Manage your products and view their details
          </p>
        </div>
        <Button onClick={handleAddProduct}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 rounded text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Categories loaded: {categories.length}</p>
          <p>Subcategories loaded: {subcategories.length}</p>
          <p>Categories: {categories.map(c => c.name).join(', ')}</p>
          <p>Subcategories: {subcategories.map(s => s.name).join(', ')}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Total available products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {products.filter(p => p.stock > 0 && p.stock < 10).length}
            </div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {products.filter(p => p.stock === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader className="px-7">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Products</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your products and inventory
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading || isRefreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${(loading || isRefreshing) ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center space-y-2 text-red-500 p-8">
              <AlertCircle className="h-8 w-8" />
              <p>{error}</p>
              <Button variant="outline" onClick={fetchData} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <ProductsTable
                products={paginatedProducts}
                categories={categories}
                subcategories={subcategories}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
              
              {/* Pagination */}
              {filteredProducts.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 p-8 text-muted-foreground">
              <Package className="h-8 w-8" />
              <p>No products found</p>
              <Button variant="outline" onClick={handleAddProduct} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden trigger for external access */}
      <button 
        ref={addButtonRef} 
        onClick={() => setIsAddDialogOpen(true)} 
        className="hidden"
        id="add-product-trigger"
      >
        Add Product
      </button>

      {/* Add Product Dialog */}
      <ProductFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={(data) => handleSaveProduct(data, true)}
        categories={categories}
        subcategories={subcategories}
        product={{
          id: '',
          name: '',
          description: '',
          price: 0,
          status: 'active',
          category: '',
          subcategory: subcategories.length > 0 ? subcategories[0].id : '', // Set default subcategory
          cost: 0,
          stock: 0,
          image_url: null,
          image_alt: null,
          points_required: 0,
          sub_category: subcategories.length > 0 ? subcategories[0].id : 0, // Set default subcategory
          is_featured: false,
          image: null,
          image_alt_description: null,
          redeem_points: 0,
          featured_points: 0,
          size: [],
          add_ons: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }}
      />
      
      {/* Edit Product Dialog */}
      {selectedProduct && (
        <ProductFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          product={selectedProduct}
          onSave={(data) => handleSaveProduct(data, false)}
          categories={categories}
          subcategories={subcategories}
        />
      )}
    </div>
  )
}