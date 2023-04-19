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
          user_id: string;
        };
        Insert: {
          company_id?: number | null;
          created_at?: string;
          date?: string;
          id?: number;
          name?: string;
          user_id: string;
        };
        Update: {
          company_id?: number | null;
          created_at?: string;
          date?: string;
          id?: number;
          name?: string;
          user_id?: string;
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
          user_id: string;
        };
        Insert: {
          company_id?: number | null;
          created_at?: string;
          id?: number;
          name?: string;
          steps?: number[];
          unit?: string;
          user_id: string;
        };
        Update: {
          company_id?: number | null;
          created_at?: string;
          id?: number;
          name?: string;
          steps?: number[];
          unit?: string;
          user_id?: string;
        };
      };
      product_record: {
        Row: {
          created_at: string;
          id: number;
          inventory_id: number;
          product_id: number;
          quantity: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          inventory_id: number;
          product_id: number;
          quantity: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          inventory_id?: number;
          product_id?: number;
          quantity?: number;
          user_id?: string;
        };
      };
      user: {
        Row: {
          company_name: string;
          id: string;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          company_name?: string;
          id: string;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          company_name?: string;
          id?: string;
          updated_at?: string | null;
          username?: string | null;
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
      test_view: {
        Row: {
          created_at: string | null;
          id: number | null;
          name: string | null;
          steps: number[] | null;
          unit: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number | null;
          name?: string | null;
          steps?: number[] | null;
          unit?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: number | null;
          name?: string | null;
          steps?: number[] | null;
          unit?: string | null;
          user_id?: string | null;
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
          user_id: string;
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
          user_id: string;
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
