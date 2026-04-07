export interface CartResponse {
  id: number;
  userId: number;
  items: CartItemResponse[];
  totalPrice: number;
}

export interface CartItemResponse {
  id: number;
  bookId: number;
  title: string;
  coverImage: string | null;
  price: number;
  quantity: number;
  subTotal: number;
}

export interface AddToCartRequest {
  bookId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
