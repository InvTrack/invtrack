export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "inventory_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "company";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "product_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "company";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "product_record_inventory_id_fkey";
            columns: ["inventory_id"];
            referencedRelation: "inventory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_record_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "product";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "worker_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "company";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "worker_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "worker_company_id_fkey";
            columns: ["id"];
            referencedRelation: "company";
            referencedColumns: ["id"];
          }
        ];
      };
      record_view: {
        Row: {
          id: number | null;
          inventory_id: number | null;
          name: string | null;
          product_id: number | null;
          quantity: number | null;
          steps: number[] | null;
          unit: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_record_inventory_id_fkey";
            columns: ["inventory_id"];
            referencedRelation: "inventory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_record_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "product";
            referencedColumns: ["id"];
          }
        ];
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
      get_previous_inventory: {
        Args: {
          inventory_id: number;
        };
        Returns: {
          company_id: number | null;
          created_at: string;
          date: string;
          id: number;
          name: string;
        }[];
      };
      get_previous_product_record: {
        Args: {
          current_inventory_id: number;
          current_product_id: number;
        };
        Returns: {
          created_at: string;
          id: number;
          inventory_id: number;
          product_id: number;
          quantity: number;
        };
      };
      get_previous_product_record_quantity: {
        Args: {
          current_inventory_id: number;
          current_product_id: number;
        };
        Returns: number;
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "buckets_owner_fkey";
            columns: ["owner"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey";
            columns: ["bucket_id"];
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "objects_owner_fkey";
            columns: ["owner"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string;
          name: string;
          owner: string;
          metadata: Json;
        };
        Returns: undefined;
      };
      extension: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      filename: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      foldername: {
        Args: {
          name: string;
        };
        Returns: unknown;
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: {
          size: number;
          bucket_id: string;
        }[];
      };
      search: {
        Args: {
          prefix: string;
          bucketname: string;
          limits?: number;
          levels?: number;
          offsets?: number;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
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
