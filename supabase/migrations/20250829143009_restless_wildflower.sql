/*
  # El Patio de Mi Casa - Schema Inicial

  1. Nuevas Tablas
    - `users` - Información de usuarios registrados
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `nombre` (text, not null)
      - `apellidos` (text, not null)
      - `direccion` (text, not null)
      - `avatar_url` (text, opcional)
      - `created_at` (timestamp with timezone)
    
    - `providers` - Proveedores de productos
      - `id` (uuid, primary key)
      - `nombre` (text, not null)
      - `provincia` (text, not null)
      - `municipio` (text, not null)
      - `telefono_whatsapp` (text, not null)
      - `created_at` (timestamp with timezone)
    
    - `categories` - Categorías de productos
      - `id` (uuid, primary key)
      - `nombre` (text, not null)
      - `descripcion` (text, not null)
      - `imagen_url` (text, not null)
      - `created_at` (timestamp with timezone)
    
    - `products` - Catálogo de productos
      - `id` (uuid, primary key)
      - `nombre` (text, not null)
      - `descripcion` (text, not null)
      - `precio` (decimal, not null)
      - `imagen_url` (text, not null)
      - `destacado` (boolean, default false)
      - `categoria_id` (uuid, foreign key)
      - `proveedor_id` (uuid, foreign key)
      - `created_at` (timestamp with timezone)
    
    - `orders` - Pedidos realizados
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `total` (decimal, not null)
      - `estado` (text, default 'pendiente')
      - `created_at` (timestamp with timezone)
    
    - `order_items` - Items de cada pedido
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `cantidad` (integer, not null)
      - `precio_unitario` (decimal, not null)
      - `created_at` (timestamp with timezone)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para usuarios autenticados
    - Políticas especiales para administradores
    - Acceso público de lectura para productos y categorías

  3. Índices
    - Índices para búsquedas eficientes
    - Índices en claves foráneas
*/

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  nombre text NOT NULL DEFAULT '',
  apellidos text NOT NULL DEFAULT '',
  direccion text NOT NULL DEFAULT '',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  provincia text NOT NULL,
  municipio text NOT NULL,
  telefono_whatsapp text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text NOT NULL DEFAULT '',
  imagen_url text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text NOT NULL DEFAULT '',
  precio decimal NOT NULL,
  imagen_url text NOT NULL DEFAULT '',
  destacado boolean DEFAULT false,
  categoria_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  proveedor_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total decimal NOT NULL,
  estado text DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now()
);

-- Tabla de items de pedidos
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  cantidad integer NOT NULL DEFAULT 1,
  precio_unitario decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla users
CREATE POLICY "Los usuarios pueden leer su propia información"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propia información"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propia información"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Políticas para providers (solo admin puede gestionar)
CREATE POLICY "Solo administradores pueden gestionar proveedores"
  ON providers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@elpatiodmicasa.com'
    )
  );

-- Políticas para categories (lectura pública, escritura admin)
CREATE POLICY "Todos pueden leer categorías"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Solo administradores pueden gestionar categorías"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@elpatiodmicasa.com'
    )
  );

CREATE POLICY "Solo administradores pueden actualizar categorías"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@elpatiodmicasa.com'
    )
  );

CREATE POLICY "Solo administradores pueden eliminar categorías"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@elpatiodmicasa.com'
    )
  );

-- Políticas para products (lectura pública, escritura admin)
CREATE POLICY "Todos pueden leer productos"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Solo administradores pueden gestionar productos"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@elpatiodmicasa.com'
    )
  );

CREATE POLICY "Solo administradores pueden actualizar productos"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@elpatiodmicasa.com'
    )
  );

CREATE POLICY "Solo administradores pueden eliminar productos"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@elpatiodmicasa.com'
    )
  );

-- Políticas para orders
CREATE POLICY "Los usuarios pueden leer sus propios pedidos"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear pedidos"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los administradores pueden leer todos los pedidos"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@elpatiodmicasa.com'
    )
  );

-- Políticas para order_items
CREATE POLICY "Los usuarios pueden leer items de sus propios pedidos"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden crear items de pedido"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Los administradores pueden leer todos los items de pedidos"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@elpatiodmicasa.com'
    )
  );

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_products_categoria ON products(categoria_id);
CREATE INDEX IF NOT EXISTS idx_products_proveedor ON products(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_products_destacado ON products(destacado);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);