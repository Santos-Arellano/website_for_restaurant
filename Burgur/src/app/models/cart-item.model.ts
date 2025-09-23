export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedExtras?: CartItemExtra[];
  notes?: string;
  subtotal?: number;
}

export interface CartItemExtra {
  id: number;
  name: string;
  price: number;
  selected: boolean;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
  discount?: number;
  deliveryFee?: number;
  tax?: number;
  finalTotal?: number;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  itemCount: number;
}