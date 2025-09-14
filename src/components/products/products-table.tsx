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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { ProductFormDialog } from "./product-form-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

export interface Product {
  id: string
  name: string
  description: string
  category: string
  subcategory: string | number
  price: number
  cost?: number
  stock?: number
  status: "active" | "inactive" | "out_of_stock"
  image_url?: string | null
  image_alt?: string | null
  image?: string | null
  createdAt: string
  updatedAt: string
  // Additional fields that might be present
  [key: string]: any
}

interface ProductsTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => Promise<void>
  categories: { id: number; name: string }[]
  subcategories: { id: number; name: string; category: number }[]
}

export function ProductsTable({ 
  products, 
  onEdit, 
  onDelete, 
  categories, 
  subcategories 
}: ProductsTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsEditConfirmOpen(true)
  }

  const handleAdd = () => {
    setSelectedProduct(null)
    setIsAddDialogOpen(true)
  }

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      setIsLoading(true)
      // The actual save logic will be handled by the parent component
      // via the onEdit or onAdd callbacks
      if (selectedProduct) {
        onEdit({ ...selectedProduct, ...productData } as Product)
      } else {
        onEdit(productData as Product)
      }
      setIsEditDialogOpen(false)
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteDialogOpen(true)
  }

  // Handle delete action from the dropdown menu
  const handleDelete = (id: string) => {
    onDelete(id).catch(console.error);
  }

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      setIsLoading(true)
      await onDelete(productToDelete.id)
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const handleConfirmEdit = () => {
    if (selectedProduct) {
      setIsEditConfirmOpen(false)
      setIsEditDialogOpen(true)
    }
  }

  // Helper function to safely get cost with a default value
  const getSafeCost = (cost?: number) => {
    return cost !== undefined ? cost : 0;
  }

  // Helper function to get the image URL
  const getImageUrl = (product: Product) => {
    return product.image_url || product.image || '/placeholder-product.png';
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "out_of_stock":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStockColor = (stock: number | undefined) => {
    if (stock === undefined || stock === null) return "text-gray-600"
    if (stock === 0) return "text-red-600"
    if (stock < 10) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Margin</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={product.image || "/placeholder.svg?height=40&width=40&query=product"}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground max-w-[200px] truncate">{product.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">{product.category}</div>
                    <div className="text-xs text-muted-foreground">{product.subcategory}</div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">Rs. {product.price}</TableCell>
                <TableCell className="text-muted-foreground">Rs. {product.cost}</TableCell>
                <TableCell>
                  <span className={`font-medium ${getStockColor(product.stock)}`}>
                    {product.stock ?? 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(product.status)}>
                    {product.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-green-600 font-medium">
                    {product.cost !== undefined ? 
                      (((product.price - product.cost) / product.price) * 100).toFixed(1) : 
                      '0.0'}%
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(product.updatedAt).toLocaleDateString()}
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
                      <DropdownMenuItem onClick={() => handleEdit(product)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Product
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog
        product={selectedProduct}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveProduct}
        categories={categories}
        subcategories={subcategories}
      />

      <ProductFormDialog
        product={null}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleSaveProduct}
        categories={categories}
        subcategories={subcategories}
      />

      {/* Edit Confirmation Dialog */}
      <Dialog open={isEditConfirmOpen} onOpenChange={setIsEditConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit product?</DialogTitle>
            <DialogDescription>
              You are about to edit {selectedProduct?.name}. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditConfirmOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleConfirmEdit} disabled={isLoading}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete {productToDelete?.name}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isLoading}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export the add dialog trigger */}
      <Button onClick={() => setIsAddDialogOpen(true)} className="hidden" id="add-product-trigger">
        Add Product
      </Button>
    </>
  )
}
