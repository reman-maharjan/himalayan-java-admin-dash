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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { ProductFormDialog } from "./product-form-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import Image from "next/image"

export interface Product {
  id: string
  name: string
  description: string
  category: string
  sub_category: string | number
  price: number
  cost?: number
  stock?: number
  status: "regular" | "featured"
  image_url?: string | null
  image_alt?: string | null
  image?: string | null
  points_required?: number
  is_featured?: boolean
  createdAt: string
  updatedAt: string
  // Additional fields that might be present
  [key: string]: unknown
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


  // Handle delete action from the dropdown menu
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteDialogOpen(true)
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

  

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Subcategory</TableHead>
              <TableHead>Price</TableHead>
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
                    <div className="text-xs text-muted-foreground">
                      {(() => {
                        const id = typeof product.sub_category === 'string' ? parseInt(product.sub_category, 10) : product.sub_category
                        const sub = subcategories.find(s => s.id === id)
                        return sub?.name ?? '-'
                      })()}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">Rs. {product.price}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleDeleteClick(product)} className="text-destructive">
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

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {productToDelete?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isLoading}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export the add dialog trigger */}
      <Button onClick={() => setIsAddDialogOpen(true)} className="hidden" id="add-product-trigger">
        Add Product
      </Button>
    </>
  )
}
