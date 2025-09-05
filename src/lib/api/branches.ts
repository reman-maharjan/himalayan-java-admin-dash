const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { getAuthHeaders, handleApiError } from '@/lib/utils/auth';

// Matches Django BranchSerializer
export interface Branch {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  created_at: string;
  updated_at: string;
}

// ✅ Create data should only include fields backend expects when creating
export interface BranchCreateData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
}

// ✅ Update data is a partial version of create data
export type BranchUpdateData = Partial<BranchCreateData>;

export const branchService = {
  // Get all branches
  async getBranches(): Promise<Branch[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/branches/`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      await handleApiError(response);
      return (await response.json()) as Branch[];
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  },

  // Get single branch by ID
  async getBranchById(id: number): Promise<Branch> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/branches/${id}/`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      await handleApiError(response);
      return (await response.json()) as Branch;
    } catch (error) {
      console.error(`Error fetching branch ${id}:`, error);
      throw error;
    }
  },

  // Create a new branch
  async createBranch(branchData: BranchCreateData): Promise<Branch> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/branches/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(branchData),
      });

      await handleApiError(response);
      return (await response.json()) as Branch;
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  },

  // Update an existing branch
  async updateBranch(id: number, branchData: BranchUpdateData): Promise<Branch> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/branches/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(branchData),
      });

      await handleApiError(response);
      return (await response.json()) as Branch;
    } catch (error) {
      console.error(`Error updating branch ${id}:`, error);
      throw error;
    }
  },

  // Delete a branch
  async deleteBranch(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/branches/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      await handleApiError(response);
    } catch (error) {
      console.error(`Error deleting branch ${id}:`, error);
      throw error;
    }
  },
};
