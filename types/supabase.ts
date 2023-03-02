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
      inventory: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          user_id?: string;
        };
      };
      product: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          unit: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name?: string;
          unit?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          unit?: string;
          user_id?: string;
        };
      };
      product_quantity: {
        Row: {
          created_at: string;
          id: number;
          inventory_id: number;
          product_id: number;
          quantity: number | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          inventory_id: number;
          product_id: number;
          quantity?: number | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          inventory_id?: number;
          product_id?: number;
          quantity?: number | null;
          user_id?: string;
        };
      };
      user: {
        Row: {
          company_name: string;
          id: string;
          updated_at: string | null;
          username: string;
        };
        Insert: {
          company_name?: string;
          id: string;
          updated_at?: string | null;
          username: string;
        };
        Update: {
          company_name?: string;
          id?: string;
          updated_at?: string | null;
          username?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
