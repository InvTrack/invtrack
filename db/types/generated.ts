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
          steps: number[];
          unit: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name?: string;
          steps?: number[];
          unit?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          steps?: number[];
          unit?: string;
          user_id?: string;
        };
      };
      record: {
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
          name: string | null;
          quantity: number | null;
        };
      };
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
