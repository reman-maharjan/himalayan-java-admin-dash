const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { getAuthHeaders, handleApiError } from '@/lib/utils/auth';

export interface Favorite {
  id: number;
  user: number;  // user ID
  product: number;  // product ID
  created_at: string;
  updated_at: string;
}

export interface CreateFavoriteData {
  product: number;  // product ID
}

export const favoriteService = {
  // Get all favorites for the current user
  async getFavorites(): Promise<Favorite[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites/`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      
      await handleApiError(response);
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  // Add a product to favorites
  async addToFavorites(productId: number): Promise<Favorite> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ product: productId }),
      });
      
      await handleApiError(response);
      
      return await response.json();
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  },

  // Remove a product from favorites
  async removeFromFavorites(favoriteId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites/${favoriteId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      
      await handleApiError(response);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  },

  // Check if a product is in favorites
  async isProductInFavorites(productId: number): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.product === productId);
    } catch (error) {
      console.error('Error checking if product is in favorites:', error);
      return false;
    }
  },

  // Toggle favorite status for a product
  async toggleFavorite(productId: number): Promise<{ added: boolean; data?: Favorite }> {
    try {
      const isFavorite = await this.isProductInFavorites(productId);
      
      if (isFavorite) {
        // Find the favorite entry to get its ID
        const favorites = await this.getFavorites();
        const favorite = favorites.find(fav => fav.product === productId);
        
        if (favorite) {
          await this.removeFromFavorites(favorite.id);
          return { added: false };
        }
      } else {
        const favorite = await this.addToFavorites(productId);
        return { added: true, data: favorite };
      }
      
      return { added: false };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }
};
