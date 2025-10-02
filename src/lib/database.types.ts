export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          nombre: string;
          apellidos: string;
          direccion: string;
          es_vendedor: boolean;
          telefono_whatsapp: string;
          provincia: string;
          municipio: string;
          avatar_url?: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nombre: string;
          apellidos: string;
          direccion: string;
          es_vendedor?: boolean;
          telefono_whatsapp?: string;
          provincia?: string;
          municipio?: string;
          avatar_url?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nombre?: string;
          apellidos?: string;
          direccion?: string;
          es_vendedor?: boolean;
          telefono_whatsapp?: string;
          provincia?: string;
          municipio?: string;
          avatar_url?: string;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string;
          imagen_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion: string;
          imagen_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string;
          imagen_url?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string;
          precio: number;
          imagen_url: string;
          destacado: boolean;
          categoria_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion: string;
          precio: number;
          imagen_url: string;
          destacado?: boolean;
          categoria_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string;
          precio?: number;
          imagen_url?: string;
          destacado?: boolean;
          categoria_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total: number;
          estado: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total: number;
          estado?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total?: number;
          estado?: string;
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          cantidad: number;
          precio_unitario: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          cantidad: number;
          precio_unitario: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          cantidad?: number;
          precio_unitario?: number;
          created_at?: string;
        };
      };
    };
  };
}