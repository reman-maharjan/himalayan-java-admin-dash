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
import Image from "next/image"

export interface Product {
  id: string
  name: string
  description: string
  category: string
  subcategory: string
  price: number
  cost: number
  stock: number
  status: "active" | "inactive" | "out_of_stock"
  image?: string
  createdAt: string
  updatedAt: string
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Himalayan Blend Coffee",
    description: "Premium coffee blend from the mountains",
    category: "Coffee",
    subcategory: "Hot Coffee",
    price: 250,
    cost: 120,
    stock: 45,
    status: "active",
    image: "/coffee-cup.png",
    createdAt: "2024-01-15",
    updatedAt: "2024-02-20",
  },
  {
    id: "2",
    name: "Espresso",
    description: "Strong and rich espresso shot",
    category: "Coffee",
    subcategory: "Hot Coffee",
    price: 180,
    cost: 80,
    stock: 32,
    status: "active",
    image: "/espresso-shot.png",
    createdAt: "2024-01-16",
    updatedAt: "2024-02-18",
  },
  {
    id: "3",
    name: "Croissant",
    description: "Buttery and flaky French pastry",
    category: "Pastries",
    subcategory: "Breakfast Pastries",
    price: 120,
    cost: 60,
    stock: 0,
    status: "out_of_stock",
    image: "/golden-croissant.png",
    createdAt: "2024-01-17",
    updatedAt: "2024-02-25",
  },
  {
    id: "4",
    name: "Green Tea",
    description: "Organic green tea leaves",
    category: "Tea",
    subcategory: "Hot Tea",
    price: 200,
    cost: 90,
    stock: 28,
    status: "active",
    image: "/cup-of-green-tea.png",
    createdAt: "2024-01-18",
    updatedAt: "2024-02-22",
  },
  {
    id: "5",
    name: "Club Sandwich",
    description: "Triple-layered sandwich with chicken",
    category: "Sandwiches",
    subcategory: "Hot Sandwiches",
    price: 350,
    cost: 180,
    stock: 15,
    status: "active",
    image: "/club-sandwich.png",
    createdAt: "2024-01-19",
    updatedAt: "2024-02-10",
  },
]

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (productId: string) => {
    setProducts(products.filter((product) => product.id !== productId))
  }

  const handleSaveProduct = (productData: Partial<Product>) => {
    if (selectedProduct) {
      // Edit existing product
      setProducts(
        products.map((product) =>
          product.id === selectedProduct.id
            ? { ...product, ...productData, updatedAt: new Date().toISOString().split("T")[0] }
            : product,
        ),
      )
    } else {
      // Add new product
      const newProduct: Product = {
        id: Date.now().toString(),
        name: productData.name || "",
        description: productData.description || "",
        category: productData.category || "",
        subcategory: productData.subcategory || "",
        price: productData.price || 0,
        cost: productData.cost || 0,
        stock: productData.stock || 0,
        status: productData.status || "active",
        image: productData.image,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      }
      setProducts([...products, newProduct])
    }
    setSelectedProduct(null)
    setIsEditDialogOpen(false)
    setIsAddDialogOpen(false)
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

  const getStockColor = (stock: number) => {
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
                  <span className={`font-medium ${getStockColor(product.stock)}`}>{product.stock}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(product.status)}>
                    {product.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-green-600 font-medium">
                    {(((product.price - product.cost) / product.price) * 100).toFixed(1)}%
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
      />

      <ProductFormDialog
        product={null}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleSaveProduct}
      />

      {/* Export the add dialog trigger */}
      <Button onClick={() => setIsAddDialogOpen(true)} className="hidden" id="add-product-trigger">
        Add Product
      </Button>
    </>
  )
}
