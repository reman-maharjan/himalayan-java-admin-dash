import { Order, OrderRequest, OrderResponse } from '@/types/orderType';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    console.log('Auth token:', token ? '***' : 'No token found');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  console.log('Request headers:', headers);
  return headers;
};

export const orderService = {
  // Create a new order
  async createOrder(orderData: OrderRequest): Promise<OrderResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get all orders
  async getOrders(): Promise<OrderResponse[]> {
    try {
      console.log('Fetching orders from:', `${API_BASE_URL}/api/orders/`);
      const response = await fetch(`${API_BASE_URL}/api/orders/`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Orders data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get order by ID
  async getOrderById(id: number): Promise<OrderResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${id}/`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(id: number, status: string): Promise<OrderResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${id}/status/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating order ${id} status:`, error);
      throw error;
    }
  },

  // Delete order
  async deleteOrder(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete order');
      }
    } catch (error) {
      console.error(`Error deleting order ${id}:`, error);
      throw error;
    }
  },
};
