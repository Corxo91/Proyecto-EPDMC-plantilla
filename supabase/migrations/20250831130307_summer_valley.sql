/*
  # Actualización del sistema de autenticación para vendedores

  1. Modificaciones a la tabla users
    - Agregar campo `es_vendedor` para identificar vendedores
    - Agregar campo `telefono_whatsapp` para contacto directo
    - Mantener campos existentes para información del vendedor

  2. Modificaciones a la tabla products
    - Cambiar relación de proveedor a usuario vendedor
    - Mantener estructura existente

  3. Seguridad
    - Actualizar políticas RLS para que cada vendedor solo vea sus productos
    - Mantener acceso público para lectura de productos
    - Restringir creación/edición de productos solo a vendedores autenticados
*/

-- Agregar campos a la tabla users para vendedores
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'es_vendedor'
  ) THEN
    ALTER TABLE users ADD COLUMN es_vendedor boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'telefono_whatsapp'
  ) THEN
    ALTER TABLE users ADD COLUMN telefono_whatsapp text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'provincia'
  ) THEN
    ALTER TABLE users ADD COLUMN provincia text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'municipio'
  ) THEN
    ALTER TABLE users ADD COLUMN municipio text DEFAULT '';
  END IF;
END $$;

-- Agregar campo user_id a products para relacionar con vendedores
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE products ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Actualizar políticas RLS para products
DROP POLICY IF EXISTS "Solo administradores pueden gestionar productos" ON products;
DROP POLICY IF EXISTS "Solo administradores pueden actualizar productos" ON products;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar productos" ON products;

-- Política para que vendedores puedan crear productos
CREATE POLICY "Los vendedores pueden crear productos"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.es_vendedor = true
    ) 
    AND auth.uid() = user_id
  );

-- Política para que vendedores puedan actualizar sus productos
CREATE POLICY "Los vendedores pueden actualizar sus productos"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.es_vendedor = true
    ) 
    AND auth.uid() = user_id
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.es_vendedor = true
    ) 
    AND auth.uid() = user_id
  );

-- Política para que vendedores puedan eliminar sus productos
CREATE POLICY "Los vendedores pueden eliminar sus productos"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.es_vendedor = true
    ) 
    AND auth.uid() = user_id
  );

-- Política para que vendedores puedan leer sus productos
CREATE POLICY "Los vendedores pueden leer sus productos"
  ON products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Actualizar políticas para categories - solo vendedores pueden gestionar
DROP POLICY IF EXISTS "Solo administradores pueden gestionar categorías" ON categories;
DROP POLICY IF EXISTS "Solo administradores pueden actualizar categorías" ON categories;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar categorías" ON categories;

CREATE POLICY "Los vendedores pueden crear categorías"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.es_vendedor = true
    )
  );

CREATE POLICY "Los vendedores pueden actualizar categorías"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.es_vendedor = true
    )
  );

CREATE POLICY "Los vendedores pueden eliminar categorías"
  ON categories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.es_vendedor = true
    )
  );

-- Eliminar tabla providers ya que ahora los vendedores están en users
DROP TABLE IF EXISTS providers CASCADE;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_users_es_vendedor ON users(es_vendedor);