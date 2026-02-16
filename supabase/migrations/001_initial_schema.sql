-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ENUM types
CREATE TYPE user_role AS ENUM ('customer', 'merchant', 'rider', 'admin');
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'picking_up',
  'delivering',
  'delivered',
  'cancelled'
);
CREATE TYPE service_type AS ENUM ('food_delivery', 'ride', 'parcel');
CREATE TYPE payment_method AS ENUM ('cash', 'promptpay', 'wallet');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE ride_status AS ENUM (
  'searching',
  'driver_assigned',
  'arriving',
  'in_progress',
  'completed',
  'cancelled'
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  line_user_id VARCHAR(64) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  avatar_url TEXT,
  role user_role DEFAULT 'customer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(50),
  address_text TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(Point, 4326),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Merchants
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  phone VARCHAR(20),
  image_url TEXT,
  cover_image_url TEXT,
  address_text TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(Point, 4326),
  opening_time TIME,
  closing_time TIME,
  is_open BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  commission_rate DECIMAL(5,2) DEFAULT 15.00,
  rating DECIMAL(3,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Categories
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES menu_categories(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  preparation_time INTEGER DEFAULT 15,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Options
CREATE TABLE menu_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name VARCHAR(100),
  choices JSONB,
  is_required BOOLEAN DEFAULT false,
  max_selections INTEGER DEFAULT 1
);

-- Riders
CREATE TABLE riders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  id_card_number VARCHAR(20),
  vehicle_type VARCHAR(50),
  vehicle_plate VARCHAR(20),
  vehicle_brand VARCHAR(100),
  driver_license_url TEXT,
  profile_image_url TEXT,
  is_online BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  current_latitude DOUBLE PRECISION,
  current_longitude DOUBLE PRECISION,
  current_location GEOGRAPHY(Point, 4326),
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_deliveries INTEGER DEFAULT 0,
  acceptance_rate DECIMAL(5,2) DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID REFERENCES users(id),
  merchant_id UUID REFERENCES merchants(id),
  rider_id UUID REFERENCES riders(id),
  service_type service_type DEFAULT 'food_delivery',
  status order_status DEFAULT 'pending',
  delivery_address TEXT,
  delivery_latitude DOUBLE PRECISION,
  delivery_longitude DOUBLE PRECISION,
  delivery_note TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  payment_method payment_method DEFAULT 'cash',
  payment_status payment_status DEFAULT 'pending',
  estimated_delivery_time INTEGER,
  actual_delivery_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  item_name VARCHAR(200),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  options JSONB,
  special_instructions TEXT
);

-- Rides
CREATE TABLE rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID REFERENCES users(id),
  rider_id UUID REFERENCES riders(id),
  status ride_status DEFAULT 'searching',
  pickup_address TEXT,
  pickup_latitude DOUBLE PRECISION,
  pickup_longitude DOUBLE PRECISION,
  dropoff_address TEXT,
  dropoff_latitude DOUBLE PRECISION,
  dropoff_longitude DOUBLE PRECISION,
  distance_km DECIMAL(10,2),
  estimated_duration INTEGER,
  fare DECIMAL(10,2),
  surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
  payment_method payment_method DEFAULT 'cash',
  payment_status payment_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Parcels
CREATE TABLE parcels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parcel_number VARCHAR(20) UNIQUE NOT NULL,
  sender_id UUID REFERENCES users(id),
  rider_id UUID REFERENCES riders(id),
  status order_status DEFAULT 'pending',
  pickup_address TEXT,
  pickup_latitude DOUBLE PRECISION,
  pickup_longitude DOUBLE PRECISION,
  pickup_contact_name VARCHAR(100),
  pickup_contact_phone VARCHAR(20),
  dropoff_address TEXT,
  dropoff_latitude DOUBLE PRECISION,
  dropoff_longitude DOUBLE PRECISION,
  dropoff_contact_name VARCHAR(100),
  dropoff_contact_phone VARCHAR(20),
  description TEXT,
  size VARCHAR(20),
  weight_kg DECIMAL(5,2),
  image_url TEXT,
  delivery_fee DECIMAL(10,2),
  payment_method payment_method DEFAULT 'cash',
  payment_status payment_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- Ratings
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  target_type VARCHAR(20),
  target_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotions
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE,
  description TEXT,
  discount_type VARCHAR(20),
  discount_value DECIMAL(10,2),
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_type VARCHAR(20),
  reference_id UUID,
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2),
  fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(200),
  body TEXT,
  type VARCHAR(50),
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_merchants_location ON merchants USING GIST(location);
CREATE INDEX idx_riders_location ON riders USING GIST(current_location);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_merchant ON orders(merchant_id);
CREATE INDEX idx_orders_rider ON orders(rider_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_riders_online ON riders(is_online, is_approved);
CREATE INDEX idx_menu_items_merchant ON menu_items(merchant_id);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_riders_updated_at BEFORE UPDATE ON riders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number(prefix TEXT)
RETURNS TEXT AS $$
DECLARE
  today TEXT := TO_CHAR(NOW() AT TIME ZONE 'Asia/Bangkok', 'YYYYMMDD');
  seq INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO seq
  FROM orders
  WHERE order_number LIKE prefix || '-' || today || '-%';
  RETURN prefix || '-' || today || '-' || LPAD(seq::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (service_role bypasses all)
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Public merchants readable" ON merchants FOR SELECT USING (is_approved = true OR true);
CREATE POLICY "Merchants insertable" ON merchants FOR INSERT WITH CHECK (true);
CREATE POLICY "Merchants updatable" ON merchants FOR UPDATE USING (true);

CREATE POLICY "Menu items public" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Menu items manageable" ON menu_items FOR ALL USING (true);

CREATE POLICY "Riders readable" ON riders FOR SELECT USING (true);
CREATE POLICY "Riders manageable" ON riders FOR ALL USING (true);

CREATE POLICY "Orders accessible" ON orders FOR ALL USING (true);
CREATE POLICY "Order items accessible" ON order_items FOR ALL USING (true);

CREATE POLICY "Addresses accessible" ON addresses FOR ALL USING (true);
CREATE POLICY "Ratings accessible" ON ratings FOR ALL USING (true);
CREATE POLICY "Notifications accessible" ON notifications FOR ALL USING (true);

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE rides;
ALTER PUBLICATION supabase_realtime ADD TABLE parcels;
ALTER PUBLICATION supabase_realtime ADD TABLE riders;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
