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

  // Get orders with server-side pagination and optional filters
  async getOrdersPaginated(params: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    branch?: number;
  }): Promise<{ orders: OrderResponse[]; count: number; next: string | null; previous: string | null }> {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', String(params.page));
      if (params.page_size) query.set('page_size', String(params.page_size));
      if (params.search) query.set('search', params.search);
      if (params.status && params.status !== 'all') query.set('status', params.status);
      if (typeof params.branch === 'number') query.set('branch', String(params.branch));

      const url = `${API_BASE_URL}/api/orders/${query.toString() ? `?${query.toString()}` : ''}`;
      const headers = getAuthHeaders();

      const response = await fetch(url, { headers, credentials: 'include' });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return { orders: [], count: 0, next: null, previous: null };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[getOrdersPaginated] API error (${response.status}):`, errorText);
        return { orders: [], count: 0, next: null, previous: null };
      }

      let responseData: any;
      try {
        responseData = await response.json();
      } catch (error) {
        console.error('[getOrdersPaginated] Failed to parse response as JSON:', error);
        return { orders: [], count: 0, next: null, previous: null };
      }

      // Extract pagination meta and items
      const count: number = typeof responseData?.count === 'number' ? responseData.count : (Array.isArray(responseData) ? responseData.length : 0);
      const next: string | null = responseData?.next ?? null;
      const previous: string | null = responseData?.previous ?? null;

      let apiOrders: any[] = [];
      if (Array.isArray(responseData)) {
        apiOrders = responseData;
      } else if (responseData && typeof responseData === 'object') {
        if (Array.isArray(responseData.results)) apiOrders = responseData.results;
        else if (Array.isArray(responseData.data)) apiOrders = responseData.data;
        else if (Array.isArray(responseData.orders)) apiOrders = responseData.orders;
        else if (responseData) apiOrders = [responseData];
      }

      const transformedOrders = apiOrders.map((apiOrder: any): OrderResponse | null => {
        try {
          if (!apiOrder) return null;

          // Safely handle cases where user might be undefined
          const user: User = {
            id: apiOrder?.user?.id || 0,
            full_name: apiOrder?.user?.full_name || 'Unknown Customer',
            email: apiOrder.user?.email || '',
            phone_number: apiOrder.user?.phone_number || 'N/A',
            profile_picture: apiOrder.user?.profile_picture || null,
            redeem_points: apiOrder.user?.redeem_points || 0,
            created_at: apiOrder.user?.created_at || new Date().toISOString(),
            updated_at: apiOrder.user?.updated_at || new Date().toISOString()
          };

          const items: OrderItemType[] = (Array.isArray(apiOrder.items) ? apiOrder.items : [])
            .filter((item: any) => item && item.id)
            .map((item: any) => {
              const product = (() => {
                if (!item.product) {
                  return { id: 0, name: 'Unknown Product', description: '', price: 0, image: '', image_alt_description: '' };
                }
                return typeof item.product === 'number'
                  ? { id: item.product, name: 'Product #' + item.product, description: '', price: 0, image: '', image_alt_description: '' }
                  : { id: item.product.id || 0, name: item.product.name || 'Unknown Product', description: item.product.description || '', price: parseFloat(item.product.price) || 0, image: item.product.image || '', image_alt_description: item.product.image_alt_description || '' };
              })();

              return { id: item.id, product, quantity: parseInt(item.quantity, 10) || 1, price: item.price ? String(item.price) : '0.00' };
            });

          return {
            id: apiOrder.id || 0,
            order_number: apiOrder.order_number || `ORDER-${Date.now()}`,
            order_status: (apiOrder.order_status || 'pending') as OrderStatus,
            order_type: apiOrder.order_type || 'standard',
            total_price: apiOrder.total_price || '0.00',
            discount: apiOrder.discount || '0.00',
            branch: apiOrder.branch || 0,
            user,
            created_at: apiOrder.created_at || new Date().toISOString(),
            updated_at: apiOrder.updated_at || new Date().toISOString(),
            items,
            customer_name: user.full_name,
            customer_phone: user.phone_number,
            notes: apiOrder.notes || ''
          };
        } catch (error) {
          console.error('[getOrdersPaginated] Error transforming order:', error, 'Order data:', apiOrder);
          return null;
        }
      });

      const safeOrders = transformedOrders.filter((o): o is OrderResponse => o !== null);
      return { orders: safeOrders, count, next, previous };
    } catch (error) {
      console.error('Error fetching paginated orders:', error);
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
      // First transform all orders, then filter out any null results
      const transformedOrders = apiOrders.map((apiOrder: any): OrderResponse | null => {
        try {
          if (!apiOrder) {
            console.warn('Skipping null/undefined order');
            return null;
          }

          // Create a safe user object with fallbacks
          // Safely handle cases where user might be undefined
          const user: User = {
            id: apiOrder?.user?.id || 0,
            full_name: apiOrder?.user?.full_name || 'Unknown Customer',
            email: apiOrder.user?.email || '',
            phone_number: apiOrder.user?.phone_number || 'N/A',
            profile_picture: apiOrder.user?.profile_picture || null,
            redeem_points: apiOrder.user?.redeem_points || 0,
            created_at: apiOrder.user?.created_at || new Date().toISOString(),
            updated_at: apiOrder.user?.updated_at || new Date().toISOString()
          };

          // Safely transform items
          const items: OrderItemType[] = (Array.isArray(apiOrder.items) ? apiOrder.items : [])
            .filter((item: any) => !!item)
            .map((item: any, index: number) => {
              const product = (() => {
                if (!item.product) {
                  return {
                    id: 0,
                    name: 'Unknown Product',
                    description: '',
                    price: 0,
                    image: '',
                    image_alt_description: ''
                  };
                }
                return typeof item.product === 'number' 
                  ? { 
                      id: item.product, 
                      name: 'Product #' + item.product, 
                      description: '', 
                      price: 0, 
                      image: '', 
                      image_alt_description: '' 
                    }
                  : { 
                      id: item.product.id || 0, 
                      name: item.product.name || 'Unknown Product',
                      description: item.product.description || '',
                      price: parseFloat(item.product.price) || 0,
                      image: item.product.image || '',
                      image_alt_description: item.product.image_alt_description || ''
                    };
              })();

              return {
                id: item.id ?? (typeof item.product === 'number' ? item.product : item.product?.id ?? index),
                product: product,
                quantity: parseInt(item.quantity, 10) || 1,
                price: item.price ? String(item.price) : '0.00'
              };
            });

          return {
            id: apiOrder.id || 0,
            order_number: apiOrder.order_number || `ORDER-${Date.now()}`,
            order_status: (apiOrder.order_status || 'pending') as OrderStatus,
            order_type: apiOrder.order_type || 'standard',
            total_price: apiOrder.total_price || '0.00',
            discount: apiOrder.discount || '0.00',
            branch: apiOrder.branch || 0,
            user: user,
            created_at: apiOrder.created_at || new Date().toISOString(),
            updated_at: apiOrder.updated_at || new Date().toISOString(),
            items: items,
            customer_name: user.full_name,
            customer_phone: user.phone_number,
            notes: apiOrder.notes || ''
          };
        } catch (error) {
          console.error('Error transforming order:', error, 'Order data:', apiOrder);
          return null;
        }
      });

      // Filter out any nulls and return
      const safeOrders = transformedOrders.filter((o): o is OrderResponse => o !== null);
      return safeOrders;
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
