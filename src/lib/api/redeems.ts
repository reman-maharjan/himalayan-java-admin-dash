import { Redeem, UserRedeem, UserRedeemWithDetails } from "@/types/redeemType"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Redeem API functions
export const redeemApi = {
  // Get all redeem offers
  async getRedeems(): Promise<Redeem[]> {
    const response = await fetch(`${API_BASE_URL}/api/redeem-offers/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch redeem offers')
    }
    
    return response.json()
  },

  // Get redeem offer by ID
  async getRedeemById(id: number): Promise<Redeem> {
    const response = await fetch(`${API_BASE_URL}/api/redeem-offers/${id}/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch redeem offer')
    }
    
    return response.json()
  },

  // Create new redeem offer
  async createRedeem(data: Partial<Redeem>): Promise<Redeem> {
    const response = await fetch(`${API_BASE_URL}/api/redeem-offers/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create redeem offer')
    }
    
    return response.json()
  },

  // Update redeem offer
  async updateRedeem(id: number, data: Partial<Redeem>): Promise<Redeem> {
    const response = await fetch(`${API_BASE_URL}/api/redeem-offers/${id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update redeem offer')
    }
    
    return response.json()
  },

  // Delete redeem offer
  async deleteRedeem(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/redeem-offers/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete redeem offer')
    }
  },
}

// User Redeem API functions
export const userRedeemApi = {
  // Get all user redemptions
  async getUserRedemptions(): Promise<UserRedeemWithDetails[]> {
    const response = await fetch(`${API_BASE_URL}/api/user-redeem/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch user redemptions')
    }
    
    return response.json()
  },

  // Get user redemptions by user ID
  async getUserRedemptionsByUserId(userId: number): Promise<UserRedeemWithDetails[]> {
    const response = await fetch(`${API_BASE_URL}/api/user-redeem/?user=${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch user redemptions')
    }
    
    return response.json()
  },

  // Create new user redemption
  async createUserRedeem(data: { redeem: number }): Promise<UserRedeem> {
    const response = await fetch(`${API_BASE_URL}/api/user-redeem/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to create user redemption')
    }
    
    return response.json()
  },

  // Get user redemption by ID
  async getUserRedeemById(id: number): Promise<UserRedeemWithDetails> {
    const response = await fetch(`${API_BASE_URL}/api/user-redeem/${id}/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch user redemption')
    }
    
    return response.json()
  },
}
