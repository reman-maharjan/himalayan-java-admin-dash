"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product } from "./products-table"

interface ProductCategory {
  id: number
  name: string
  subcategories?: { id: number; name: string }[]
}


interface ProductFormDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: Partial<Product>) => void
  categories: ProductCategory[]
  subcategories: { id: number; name: string; category: number }[]
}

export function ProductFormDialog({ 
  product, 
  open, 
  onOpenChange, 
  onSave, 
  categories, 
  subcategories 
}: ProductFormDialogProps) {
  const [formData, setFormData] = useState({
    id: '',
    name: "",
    description: "",
    price: 0,
    category: "",
    subcategory: "",
    cost: 0,
    stock: 0,
    status: "active" as Product["status"],
    image_url: "",
    image: "", // Fixed: Added missing image field
    points_required: 0,
    is_featured: false,
  })

  const [availableSubcategories, setAvailableSubcategories] = useState<{ id: number; name: string }[]>([])

  // Debug logging
  useEffect(() => {
    console.log('ProductFormDialog - Categories:', categories);
    console.log('ProductFormDialog - Subcategories:', subcategories);
    console.log('ProductFormDialog - Product:', product);
  }, [categories, subcategories, product]);

  // Update available subcategories when category changes
  useEffect(() => {
    console.log('Category changed:', formData.category);
    if (formData.category) {
      const categoryId = parseInt(formData.category, 10);
      console.log('Looking for subcategories with category ID:', categoryId);
      const filteredSubs = subcategories.filter(sub => sub.category === categoryId);
      console.log('Filtered subcategories:', filteredSubs);
      setAvailableSubcategories(filteredSubs);
      // Reset subcategory when category changes (only if it's not the initial load)
      if (formData.subcategory && !product) {
        setFormData(prev => ({ ...prev, subcategory: '' }));
      }
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.category, formData.subcategory, subcategories, product]);

  // Initialize form with product data when editing
  useEffect(() => {
    if (product && open) {
      console.log('Initializing form with product:', product);
      
      // Find the category that contains the subcategory
      let categoryId = '';
      let subcategoryId = '';
      
      if (typeof product.subcategory === 'number') {
        // product.subcategory is the subcategory ID
        subcategoryId = product.subcategory.toString();
        const foundSubcat = subcategories.find(sub => sub.id === product.subcategory);
        if (foundSubcat) {
          categoryId = foundSubcat.category.toString();
        }
      } else if (typeof product.subcategory === 'string') {
        // Try to parse as number first
        const subcatId = parseInt(product.subcategory);
        if (!isNaN(subcatId)) {
          subcategoryId = subcatId.toString();
          const foundSubcat = subcategories.find(sub => sub.id === subcatId);
          if (foundSubcat) {
            categoryId = foundSubcat.category.toString();
          }
        }
      }

      // If we still don't have a category, try to find it from product.category
      if (!categoryId && product.category) {
        const foundCat = categories.find(cat => cat.name === product.category);
        if (foundCat) {
          categoryId = foundCat.id.toString();
        }
      }
      
      console.log('Setting form data - Category ID:', categoryId, 'Subcategory ID:', subcategoryId);
      
      setFormData({
        id: product.id,
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        category: categoryId,
        subcategory: subcategoryId,
        cost: product.cost || 0,
        stock: product.stock || 0,
        status: product.status || 'active',
        image_url: product.image_url || '',
        image: product.image || '',
        points_required: product.points_required || 0,
        is_featured: product.is_featured || false,
      });
    } else if (!product && open) {
      // Reset form for new product
      console.log('Resetting form for new product');
      setFormData({
        id: '',
        name: '',
        description: '',
        price: 0,
        category: '',
        subcategory: '',
        cost: 0,
        stock: 0,
        status: 'active',
        image_url: '',
        image: '',
        points_required: 0,
        is_featured: false,
      });
      setAvailableSubcategories([]);
    }
  }, [product, open, categories, subcategories])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting form data:', formData);
    
    // Ensure we're sending the correct data format
    const submitData = {
      ...formData,
      // Convert subcategory to number if it's a string
      subcategory: formData.subcategory ? parseInt(formData.subcategory) : undefined,
      // Add the category name for display purposes
      category: categories.find(cat => cat.id.toString() === formData.category)?.name || ''
    };
    
    console.log('Processed submit data:', submitData);
    onSave(submitData)
  }

  const handleCategoryChange = (value: string) => {
    console.log('Category changed to:', value);
    setFormData(prev => ({
      ...prev,
      category: value,
      subcategory: '' // Reset subcategory when category changes
    }));
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image_url: URL.createObjectURL(file),
          image: URL.createObjectURL(file)
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update product information below." : "Fill in the details to create a new product."}
          </DialogDescription>
        </DialogHeader>
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 p-2 rounded text-xs">
            <p><strong>Debug:</strong></p>
            <p>Categories: {categories.length}</p>
            <p>Subcategories: {subcategories.length}</p>
            <p>Available Subcategories: {availableSubcategories.length}</p>
            <p>Selected Category: {formData.category}</p>
            <p>Selected Subcategory: {formData.subcategory}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive" | "out_of_stock") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
              <div className="grid gap-2">
                <Label htmlFor="subcategory">Sub-category</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) => {
                    console.log('Subcategory changed to:', value);
                    setFormData({ ...formData, subcategory: value });
                  }}
                  disabled={!formData.category || availableSubcategories.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.category 
                        ? "Select category first" 
                        : availableSubcategories.length === 0 
                          ? "No subcategories available"
                          : "Select sub-category"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (Rs.)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cost">Cost (Rs.)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value, image: e.target.value })}
                placeholder="Enter image URL (optional)"
              />
            </div>

            {/* Alternative file upload */}
            <div className="grid gap-2">
              <Label htmlFor="image-file">Or Upload Image</Label>
              <Input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            {formData.price > 0 && formData.cost > 0 && (
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm font-medium">Profit Margin</div>
                <div className="text-lg font-bold text-green-600">
                  {(((formData.price - formData.cost) / formData.price) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Profit: Rs. {(formData.price - formData.cost).toFixed(2)}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.category || !formData.subcategory}>
              {product ? "Update Product" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}