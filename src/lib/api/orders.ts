import { 
  Order, 
  OrderRequest, 
  OrderResponse, 
  OrderStatus, 
  ApiOrderResponse, 
  User,
  OrderItem as OrderItemType,
  Product
} from '@/types/orderType';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { getAuthHeaders, handleApiError } from '@/lib/utils/auth';

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

      await handleApiError(response);

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get all orders
  async getOrders(): Promise<OrderResponse[]> {
    try {
      const url = `${API_BASE_URL}/api/orders/`;
      const headers = getAuthHeaders();
      console.log('Fetching orders from:', url);
      console.log('Request headers:', headers);
      
      const response = await fetch(url, {
        headers,
        credentials: 'include',
      });
      
      // Log response status and headers
      console.log('[getOrders] Response status:', response.status, response.statusText);
      console.log('[getOrders] Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.error('[getOrders] Authentication failed. Redirecting to login.');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return [];
      }
      
      // Check for other error statuses
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[getOrders] API error (${response.status}):`, errorText);
        return [];
      }
      
      // Parse JSON response
      let responseData;
      try {
        responseData = await response.json();
        console.log('[getOrders] Parsed response data:', responseData);
      } catch (error) {
        console.error('[getOrders] Failed to parse response as JSON:', error);
        return [];
      }
      
      // Handle different response formats
      let apiOrders: any[] = [];
      
      if (Array.isArray(responseData)) {
        apiOrders = responseData;
      } else if (responseData && typeof responseData === 'object') {
        // Check for common pagination formats
        if (Array.isArray(responseData.results)) {
          apiOrders = responseData.results;
        } else if (Array.isArray(responseData.data)) {
          apiOrders = responseData.data;
        } else if (responseData.orders && Array.isArray(responseData.orders)) {
          apiOrders = responseData.orders;
        } else {
          // If it's a single order object, wrap it in an array
          apiOrders = [responseData];
        }
      }
      
      console.log('Processed orders array:', apiOrders);
      
      if (!Array.isArray(apiOrders)) {
        console.error('Expected an array of orders but got:', apiOrders);
        return [];
      }
      
      // Transform the API response to match our frontend types
      return apiOrders.map((apiOrder: any): OrderResponse => {
        // Create a minimal user object with required fields
        const user: User = {
          id: apiOrder.user.id,
          full_name: apiOrder.user.full_name,
          email: '', // Default empty email since it's not in the API response
          phone_number: apiOrder.user.phone_number,
          profile_picture: null,
          redeem_points: 0,
          created_at: apiOrder.created_at,
          updated_at: apiOrder.updated_at
        };

        // Transform items to match OrderItem type
        const items: OrderItemType[] = apiOrder.items.map((item: any) => {
          const product = typeof item.product === 'number' 
            ? { id: item.product, name: 'Product', description: '', price: 0, image: '', image_alt_description: '' }
            : { 
                id: item.product.id, 
                name: item.product.name, 
                description: '', 
                price: 0, 
                image: '', 
                image_alt_description: '' 
              };

          return {
            id: item.id,
            product: product,
            quantity: item.quantity,
            price: item.price
          };
        });

        return {
          id: apiOrder.id,
          order_number: apiOrder.order_number,
          order_status: apiOrder.order_status as OrderStatus,
          order_type: apiOrder.order_type,
          total_price: apiOrder.total_price,
          discount: apiOrder.discount || '0',
          branch: apiOrder.branch,
          user: user,
          created_at: apiOrder.created_at,
          updated_at: apiOrder.updated_at,
          items: items,
          customer_name: apiOrder.user.full_name,
          customer_phone: apiOrder.user.phone_number,
          notes: ''
        };
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get orders filtered by branch ID
  async getOrdersByBranch(branchId: number): Promise<OrderResponse[]> {
    try {
      const url = `${API_BASE_URL}/api/orders/?branch=${encodeURIComponent(branchId)}`;
      const headers = getAuthHeaders();
      
      console.log(`[getOrdersByBranch] Fetching orders for branch ${branchId} from:`, url);
      console.log('[getOrdersByBranch] Request headers:', headers);
      
      const response = await fetch(url, {
        headers,
        credentials: 'include',
      });

      // Log response status and headers
      console.log(`[getOrdersByBranch] Response status:`, response.status, response.statusText);
      console.log('[getOrdersByBranch] Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.error('[getOrdersByBranch] Authentication failed. Redirecting to login.');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return [];
      }
      
      // Check for other error statuses
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[getOrdersByBranch] API error (${response.status}):`, errorText);
        return [];
      }
      
      // Parse JSON response
      let responseData;
      try {
        responseData = await response.json();
        console.log('[getOrdersByBranch] Parsed response data:', responseData);
      } catch (error) {
        console.error('[getOrdersByBranch] Failed to parse response as JSON:', error);
        return [];
      }
      
      // Handle different possible response formats
      let apiOrders: ApiOrderResponse[] = [];
      
      if (Array.isArray(responseData)) {
        // If the response is an array, use it directly
        apiOrders = responseData;
        console.log('[getOrdersByBranch] Using direct array response with', apiOrders.length, 'orders');
      } else if (responseData.results && Array.isArray(responseData.results)) {
        // If the response has a results array, use that
        apiOrders = responseData.results;
        console.log('[getOrdersByBranch] Using results array with', apiOrders.length, 'orders');
      } else if (responseData.data && Array.isArray(responseData.data)) {
        // If the response has a data array, use that
        apiOrders = responseData.data;
        console.log('[getOrdersByBranch] Using data array with', apiOrders.length, 'orders');
      } else if (typeof responseData === 'object' && responseData !== null) {
        // If it's a single order object, wrap it in an array
        apiOrders = [responseData];
      }
      
      console.log('Processed API orders:', apiOrders);

      return apiOrders.map((apiOrder): OrderResponse => {
        const user: User = {
          id: apiOrder.user.id,
          full_name: apiOrder.user.full_name,
          email: '',
          phone_number: apiOrder.user.phone_number,
          profile_picture: null,
          redeem_points: 0,
          created_at: apiOrder.created_at,
          updated_at: apiOrder.updated_at,
        };

        const items: OrderItemType[] = apiOrder.items.map(item => {
          const product = typeof item.product === 'number'
            ? { id: item.product, name: 'Product', description: '', price: 0, image: '', image_alt_description: '' }
            : {
                id: item.product.id,
                name: item.product.name,
                description: '',
                price: 0,
                image: '',
                image_alt_description: '',
              };

          return {
            id: item.id,
            product,
            quantity: item.quantity,
            price: item.price,
          };
        });

        return {
          id: apiOrder.id,
          order_number: apiOrder.order_number,
          order_status: apiOrder.order_status as OrderStatus,
          order_type: apiOrder.order_type,
          total_price: apiOrder.total_price,
          discount: apiOrder.discount || '0',
          branch: apiOrder.branch,
          user,
          created_at: apiOrder.created_at,
          updated_at: apiOrder.updated_at,
          items,
          customer_name: apiOrder.user.full_name,
          customer_phone: apiOrder.user.phone_number,
          notes: '',
        };
      });
    } catch (error) {
      console.error('Error fetching orders by branch:', error);
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

      await handleApiError(response);

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

      await handleApiError(response);

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

      await handleApiError(response);

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
