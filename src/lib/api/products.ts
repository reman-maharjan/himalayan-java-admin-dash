const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { getAuthHeaders, handleApiError } from '@/lib/utils/auth';

interface ProductSize {
  id: number;
  name: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
  product_count?: number;
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

export const productService = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      await handleApiError(response);
      
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
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      await handleApiError(response);
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Create new product
  async createProduct(productData: FormData | Omit<Product, 'id'>): Promise<Product> {
    try {
      let headers: Record<string, string> = {};
      let body: BodyInit;
      
      // Handle FormData (for file uploads)
      if (productData instanceof FormData) {
        // For FormData, the browser will set the correct Content-Type with boundary
        headers = {};
        body = productData;
      } else {
        body = JSON.stringify(productData);
      }

      const response = await fetch(`${API_BASE_URL}/api/products/`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          ...headers,
        },
        credentials: 'include',
        body,
      });

      await handleApiError(response);
      
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
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      await handleApiError(response);
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      
      await handleApiError(response);
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  },

  // Create a new category
  async createCategory(name: string, description: string = ''): Promise<ProductCategory> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/category/`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, description }),
      });
      
      await handleApiError(response);
      
      return await response.json();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Create a new subcategory
  async createSubcategory(name: string, categoryId: number): Promise<SubCategory> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subcategory/`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          name,
          category: categoryId 
        }),
      });
      
      await handleApiError(response);
      
      return await response.json();
    } catch (error) {
      console.error('Error creating subcategory:', error);
      throw error;
    }
  },

  // Delete a category
  async deleteCategory(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/category/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      
      await handleApiError(response);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Delete a subcategory
  async deleteSubcategory(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subcategory/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      
      await handleApiError(response);
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      throw error;
    }
  }
};