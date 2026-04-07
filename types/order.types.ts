export interface OrderResponse {
  id: number;
  userId: number;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  orderItems: OrderItemResponse[];
}

export interface OrderItemResponse {
  id: number;
  bookId: number;
  bookTitle: string;
  quantity: number;
  price: number;
}

export interface OrderItemRequest {
  bookId: number;
  quantity: number;
}

export interface OrderRequest {
  shippingAddress: string;
  phoneNumber: string;
  items: OrderItemRequest[];
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
