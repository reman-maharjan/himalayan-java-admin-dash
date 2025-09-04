
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderItem {
    id?: number;
    product: number; // product ID
    quantity: number;
    price: number;
    name?: string; // Product name (for display purposes)
}

export interface Order {
    id?: number;
    total_price: number;
    branch: number; // branch ID
    items: OrderItem[];
    created_at?: string;
    status: OrderStatus;
    customer_name?: string;
    customer_phone?: string;
    notes?: string;
}

export interface OrderResponse extends Omit<Order, 'items'> {
    items: Array<OrderItem & { id: number; product: Product }>;
}

export interface OrderRequest {
    total_price: number;
    branch: number;
    items: Array<{
        product: number;
        quantity: number;
        price: number;
    }>;
    customer_name?: string;
    customer_phone?: string;
    notes?: string;
    status?: OrderStatus;
}
