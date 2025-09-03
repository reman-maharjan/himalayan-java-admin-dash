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
import { MoreHorizontal, Edit, Trash2, Package } from "lucide-react"
import { CategoryFormDialog } from "./category-form-dialog"

export interface Category {
  id: string
  name: string
  description: string
  status: "active" | "inactive"
  productCount: number
  createdAt: string
  updatedAt: string
}

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Coffee",
    description: "All types of coffee beverages",
    status: "active",
    productCount: 25,
    createdAt: "2024-01-15",
    updatedAt: "2024-02-20",
  },
  {
    id: "2",
    name: "Tea",
    description: "Various tea selections",
    status: "active",
    productCount: 18,
    createdAt: "2024-01-16",
    updatedAt: "2024-02-18",
  },
  {
    id: "3",
    name: "Pastries",
    description: "Fresh baked goods and pastries",
    status: "active",
    productCount: 32,
    createdAt: "2024-01-17",
    updatedAt: "2024-02-25",
  },
  {
    id: "4",
    name: "Sandwiches",
    description: "Freshly made sandwiches",
    status: "active",
    productCount: 15,
    createdAt: "2024-01-18",
    updatedAt: "2024-02-22",
  },
  {
    id: "5",
    name: "Merchandise",
    description: "Himalayan Java branded items",
    status: "inactive",
    productCount: 8,
    createdAt: "2024-01-19",
    updatedAt: "2024-02-10",
  },
]

export function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (categoryId: string) => {
    setCategories(categories.filter((category) => category.id !== categoryId))
  }

  const handleSaveCategory = (categoryData: Partial<Category>) => {
    if (selectedCategory) {
      // Edit existing category
      setCategories(
        categories.map((category) =>
          category.id === selectedCategory.id
            ? { ...category, ...categoryData, updatedAt: new Date().toISOString().split("T")[0] }
            : category,
        ),
      )
    } else {
      // Add new category
      const newCategory: Category = {
        id: Date.now().toString(),
        name: categoryData.name || "",
        description: categoryData.description || "",
        status: categoryData.status || "active",
        productCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      }
      setCategories([...categories, newCategory])
    }
    setSelectedCategory(null)
    setIsEditDialogOpen(false)
    setIsAddDialogOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
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
              <TableHead>Category Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {category.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate" title={category.description}>
                    {category.description}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(category.status)}>
                    {category.status}
                  </Badge>
                </TableCell>
                <TableCell>{category.productCount}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(category.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(category.updatedAt).toLocaleDateString()}
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
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Category
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(category.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Category
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CategoryFormDialog
        category={selectedCategory}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveCategory}
      />

      <CategoryFormDialog
        category={null}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleSaveCategory}
      />

      {/* Export the add dialog trigger */}
      <Button onClick={() => setIsAddDialogOpen(true)} className="hidden" id="add-category-trigger">
        Add Category
      </Button>
    </>
  )
}
