export type UserRole = 'customer' | 'merchant' | 'rider' | 'admin';

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picking_up' | 'delivering' | 'delivered' | 'cancelled';
export type ServiceType = 'food_delivery' | 'ride' | 'parcel';
export type PaymentMethod = 'cash' | 'promptpay' | 'wallet';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type RideStatus = 'searching' | 'driver_assigned' | 'arriving' | 'in_progress' | 'completed' | 'cancelled';

export interface User {
  id: string;
  line_user_id: string;
  display_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  address_text: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
  created_at: string;
}

export interface Merchant {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  category: string | null;
  phone: string | null;
  image_url: string | null;
  cover_image_url: string | null;
  address_text: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_time: string | null;
  closing_time: string | null;
  is_open: boolean;
  is_approved: boolean;
  commission_rate: number;
  rating: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  merchant_id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  merchant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  preparation_time: number;
  sort_order: number;
  created_at: string;
}

export interface MenuOption {
  id: string;
  menu_item_id: string;
  name: string | null;
  choices: { name: string; price: number }[] | null;
  is_required: boolean;
  max_selections: number;
}

export interface Rider {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  id_card_number: string | null;
  vehicle_type: string | null;
  vehicle_plate: string | null;
  vehicle_brand: string | null;
  driver_license_url: string | null;
  profile_image_url: string | null;
  is_online: boolean;
  is_approved: boolean;
  current_latitude: number | null;
  current_longitude: number | null;
  rating: number;
  total_deliveries: number;
  acceptance_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  merchant_id: string | null;
  rider_id: string | null;
  service_type: ServiceType;
  status: OrderStatus;
  delivery_address: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  delivery_note: string | null;
  subtotal: number;
  delivery_fee: number;
  platform_fee: number;
  discount: number;
  total: number;
  commission_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  estimated_delivery_time: number | null;
  actual_delivery_time: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  merchant?: Merchant;
  rider?: Rider;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  options: Record<string, string> | null;
  special_instructions: string | null;
}

export interface Ride {
  id: string;
  ride_number: string;
  customer_id: string | null;
  rider_id: string | null;
  status: RideStatus;
  pickup_address: string | null;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  dropoff_address: string | null;
  dropoff_latitude: number | null;
  dropoff_longitude: number | null;
  distance_km: number | null;
  estimated_duration: number | null;
  fare: number | null;
  surge_multiplier: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  created_at: string;
  completed_at: string | null;
}

export interface Parcel {
  id: string;
  parcel_number: string;
  sender_id: string | null;
  rider_id: string | null;
  status: OrderStatus;
  pickup_address: string | null;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  pickup_contact_name: string | null;
  pickup_contact_phone: string | null;
  dropoff_address: string | null;
  dropoff_latitude: number | null;
  dropoff_longitude: number | null;
  dropoff_contact_name: string | null;
  dropoff_contact_phone: string | null;
  description: string | null;
  size: 'small' | 'medium' | 'large' | null;
  weight_kg: number | null;
  image_url: string | null;
  delivery_fee: number | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  created_at: string;
  delivered_at: string | null;
}

export interface Rating {
  id: string;
  user_id: string | null;
  target_type: 'merchant' | 'rider' | 'order';
  target_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Promotion {
  id: string;
  code: string | null;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  title: string | null;
  body: string | null;
  type: 'order_update' | 'new_job' | 'promotion' | 'general';
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  options: Record<string, string>;
  specialInstructions?: string;
}
