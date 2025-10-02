/*
  # Actualizar sistema de vendedores

  1. Cambios en la tabla users
    - Todos los usuarios registrados manualmente serán vendedores por defecto
    - Actualizar políticas RLS para vendedores

  2. Seguridad
    - Actualizar políticas para permitir acceso a vendedores autenticados
    - Simplificar verificación de vendedores
*/

-- Actualizar todos los usuarios existentes para que sean vendedores
UPDATE users SET es_vendedor = true WHERE es_vendedor IS NULL OR es_vendedor = false;

-- Actualizar el valor por defecto para nuevos usuarios
ALTER TABLE users ALTER COLUMN es_vendedor SET DEFAULT true;

-- Actualizar políticas de productos para vendedores
DROP POLICY IF EXISTS "Los vendedores pueden leer sus productos" ON products;
DROP POLICY IF EXISTS "Los vendedores pueden crear productos" ON products;
DROP POLICY IF EXISTS "Los vendedores pueden actualizar sus productos" ON products;
DROP POLICY IF EXISTS "Los vendedores pueden eliminar sus productos" ON products;

-- Crear nuevas políticas más simples
CREATE POLICY "Vendedores pueden gestionar sus productos - SELECT"
  ON products
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Vendedores pueden gestionar sus productos - INSERT"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Vendedores pueden gestionar sus productos - UPDATE"
  ON products
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Vendedores pueden gestionar sus productos - DELETE"
  ON products
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Actualizar políticas de categorías para vendedores autenticados
DROP POLICY IF EXISTS "Los vendedores pueden crear categorías" ON categories;
DROP POLICY IF EXISTS "Los vendedores pueden actualizar categorías" ON categories;
DROP POLICY IF EXISTS "Los vendedores pueden eliminar categorías" ON categories;

CREATE POLICY "Vendedores pueden gestionar categorías - INSERT"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Vendedores pueden gestionar categorías - UPDATE"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Vendedores pueden gestionar categorías - DELETE"
  ON categories
  FOR DELETE
  TO authenticated
  USING (true);