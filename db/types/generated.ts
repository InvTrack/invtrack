export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      company: {
        Row: {
          created_at: string | null;
          id: number;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          name?: string;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          name?: string;
        };
      };
      inventory: {
        Row: {
          company_id: number | null;
          created_at: string;
          date: string;
          id: number;
          name: string;
        };
        Insert: {
          company_id?: number | null;
          created_at?: string;
          date?: string;
          id?: number;
          name?: string;
        };
        Update: {
          company_id?: number | null;
          created_at?: string;
          date?: string;
          id?: number;
          name?: string;
        };
      };
      product: {
        Row: {
          company_id: number | null;
          created_at: string;
          id: number;
          name: string;
          steps: number[];
          unit: string;
        };
        Insert: {
          company_id?: number | null;
          created_at?: string;
          id?: number;
          name?: string;
          steps?: number[];
          unit?: string;
        };
        Update: {
          company_id?: number | null;
          created_at?: string;
          id?: number;
          name?: string;
          steps?: number[];
          unit?: string;
        };
      };
      product_record: {
        Row: {
          created_at: string;
          id: number;
          inventory_id: number;
          product_id: number;
          quantity: number;
        };
        Insert: {
          created_at?: string;
          id?: number;
          inventory_id: number;
          product_id: number;
          quantity: number;
        };
        Update: {
          created_at?: string;
          id?: number;
          inventory_id?: number;
          product_id?: number;
          quantity?: number;
        };
      };
      worker: {
        Row: {
          company_id: number | null;
          created_at: string;
          id: string;
          is_admin: boolean;
          name: string | null;
        };
        Insert: {
          company_id?: number | null;
          created_at?: string;
          id: string;
          is_admin?: boolean;
          name?: string | null;
        };
        Update: {
          company_id?: number | null;
          created_at?: string;
          id?: string;
          is_admin?: boolean;
          name?: string | null;
        };
      };
    };
    Views: {
      current_company_id: {
        Row: {
          id: number | null;
        };
        Insert: {
          id?: number | null;
        };
        Update: {
          id?: number | null;
        };
      };
      record_view: {
        Row: {
          id: number | null;
          inventory_id: number | null;
          name: string | null;
          quantity: number | null;
          steps: number[] | null;
          unit: string | null;
        };
      };
    };
    Functions: {
      add_next_product_record: {
        Args: {
          product_record_id: number;
          new_inventory_id: number;
        };
        Returns: {
          created_at: string;
          id: number;
          inventory_id: number;
          product_id: number;
          quantity: number;
        };
      };
      handle_new_inventory_func: {
        Args: {
          new_date: string;
          inventory_id: number;
        };
        Returns: {
          company_id: number | null;
          created_at: string;
          date: string;
          id: number;
          name: string;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
