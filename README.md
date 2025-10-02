# cambios que hice
en el header el carrito icono

# El Patio de Mi Casa - Ecommerce Platform

Una plataforma de ecommerce para productos locales con sistema de vendedores independientes.

## Características Principales

- **Catálogo de Productos**: Navegación y búsqueda de productos locales
- **Sistema de Vendedores**: Cada vendedor tiene su panel independiente
- **Carrito Inteligente**: Agrupa pedidos por vendedor automáticamente
- **Integración WhatsApp**: Checkout directo con cada vendedor
- **Gestión de Categorías**: Organización de productos por categorías
- **Responsive Design**: Optimizado para móviles y desktop

## Configuración de Vendedores

Para agregar un nuevo vendedor, debes insertar manualmente en la tabla `users` de Supabase:

```sql
INSERT INTO users (
  id,
  email,
  nombre,
  apellidos,
  direccion,
  telefono_whatsapp,
  provincia,
  municipio,
  es_vendedor
) VALUES (
  'uuid-del-usuario-auth',
  'vendedor@ejemplo.com',
  'Nombre',
  'Apellidos',
  'Dirección completa',
  '+53 5XXX XXXX',
  'Provincia',
  'Municipio',
  true
);
```

**Importante**: El `id` debe coincidir con el UUID del usuario creado en Supabase Auth.

## Flujo de Compra

1. Cliente navega y agrega productos al carrito
2. En checkout, el carrito se agrupa automáticamente por vendedor
3. Se genera un mensaje de WhatsApp para cada vendedor con:
   - Información del cliente
   - Productos y cantidades
   - Total por vendedor
   - Datos de contacto

## Estructura de la Base de Datos

- **users**: Información de vendedores y clientes
- **categories**: Categorías de productos
- **products**: Productos con relación al vendedor (user_id)
- **orders**: Historial de pedidos
- **order_items**: Detalles de cada pedido

## Tecnologías

- React + TypeScript
- Tailwind CSS
- Supabase (Auth + Database)
- React Router
- Lucide Icons

## Desarrollo

```bash
npm run dev
```

## Configuración

1. Conectar a Supabase usando el botón en la interfaz
2. Ejecutar las migraciones de base de datos
3. Crear vendedores manualmente en la tabla users
4. Configurar autenticación por email/password en Supabase