export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  image_alt_description: string;
}

export interface OrderItemBase {
  product: number; // product ID
  quantity: number;
  price: string; // comes as string from API (DecimalField)
}

export interface OrderItem extends Omit<OrderItemBase, 'product'> {
  id: number;
  product: Product;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  profile_picture: string | null;
  redeem_points: number;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface Order {
  id: number;
  order_number: string;
  order_status: OrderStatus;
  order_type: string;
  total_price: string;
  discount: string;
  user: User;
  branch: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
}

export interface OrderResponse extends Omit<Order, 'items'> {
  items: OrderItem[];
}

export interface OrderRequest {
  total_price: string;
  branch: number;
  items: OrderItemBase[];
  user?: Omit<User, 'id' | 'created_at' | 'updated_at'>;
  notes?: string;
  status?: OrderStatus;
}

// API Response Types
interface ApiUserResponse {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  profile_picture: string | null;
  redeem_points: number;
  created_at: string;
  updated_at: string;
}

interface ApiOrderItemResponse {
  id: number;
  product: number | Product;
  quantity: number;
  price: string;
}

export interface ApiOrderResponse {
  id: number;
  order_number: string;
  order_status: OrderStatus;
  order_type: string;
  total_price: string;
  discount: string | null;
  branch: number;
  user: ApiUserResponse;
  created_at: string;
  updated_at: string;
  items: ApiOrderItemResponse[];
}
