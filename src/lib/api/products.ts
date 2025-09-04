import { authService } from './auth';

interface ProductSize {
  id: number;
  name: string;
}

interface ProductCategory {
  id: number;
  name: string;
}

export interface SubCategory {
  id: number;
  name: string;
  category: number; // category ID
}

interface ProductAddOn {
  id: number;
  name: string;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string | null;
  image_alt_description: string | null;
  size: ProductSize[];
  sub_category: number; // subcategory ID
  redeem_points: number;
  is_featured: boolean;
  featured_points: number;
  add_ons: ProductAddOn[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const productService = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product by ID
  async getProductById(id: number): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}/`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Create new product
  async createProduct(productData: FormData): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: productData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create product');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  async updateProduct(id: number, productData: Partial<Product> | FormData): Promise<Product> {
    try {
      const isFormData = productData instanceof FormData;
      
      const response = await fetch(`${API_BASE_URL}/api/products/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: isFormData ? productData : JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update product');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  // Get all categories
  async getCategories(): Promise<ProductCategory[]> {
    try {
      console.log('Fetching categories from:', `${API_BASE_URL}/api/category/`);
      const response = await fetch(`${API_BASE_URL}/api/category/`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies for session-based auth if needed
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: response.url
        });
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Categories API Response:', data);
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? `Error in getCategories: ${error.message}`
        : 'An unknown error occurred while fetching categories';
      
      console.error(errorMessage, {
        error,
        timestamp: new Date().toISOString()
      });
      
      throw new Error(errorMessage);
    }
  },

  // Get all subcategories
  async getSubcategories(categoryId?: number): Promise<SubCategory[]> {
    const url = categoryId 
      ? `${API_BASE_URL}/api/subcategory/?category=${categoryId}`
      : `${API_BASE_URL}/api/subcategory/`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  }
};