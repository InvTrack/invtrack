export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
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
      barcode: {
        Row: {
          code: string;
          company_id: number;
          created_at: string;
          product_id: number | null;
        };
        Insert: {
          code: string;
          company_id: number;
          created_at?: string;
          product_id?: number | null;
        };
        Update: {
          code?: string;
          company_id?: number;
          created_at?: string;
          product_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "barcode_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "company";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "barcode_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "product";
            referencedColumns: ["id"];
          }
        ];
      };
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
          is_delivery: boolean;
          last_product_record_updated_at: string | null;
          low_quantity_notification_sent: boolean | null;
          name: string;
        };
        Insert: {
          company_id?: number | null;
          created_at?: string;
          date?: string;
          id?: number;
          is_delivery?: boolean;
          last_product_record_updated_at?: string | null;
          low_quantity_notification_sent?: boolean | null;
          name?: string;
        };
        Update: {
          company_id?: number | null;
          created_at?: string;
          date?: string;
          id?: number;
          is_delivery?: boolean;
          last_product_record_updated_at?: string | null;
          low_quantity_notification_sent?: boolean | null;
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
          category_id: number | null;
          company_id: number | null;
          created_at: string;
          display_order: number;
          id: number;
          name: string;
          notification_threshold: number;
          steps: number[];
          unit: string;
        };
        Insert: {
          category_id?: number | null;
          company_id?: number | null;
          created_at?: string;
          display_order?: number;
          id?: number;
          name?: string;
          notification_threshold?: number;
          steps?: number[];
          unit?: string;
        };
        Update: {
          category_id?: number | null;
          company_id?: number | null;
          created_at?: string;
          display_order?: number;
          id?: number;
          name?: string;
          notification_threshold?: number;
          steps?: number[];
          unit?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "product_category";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "company";
            referencedColumns: ["id"];
          }
        ];
      };
      product_category: {
        Row: {
          company_id: number | null;
          created_at: string;
          display_order: number;
          id: number;
          name: string;
        };
        Insert: {
          company_id?: number | null;
          created_at?: string;
          display_order?: number;
          id?: number;
          name: string;
        };
        Update: {
          company_id?: number | null;
          created_at?: string;
          display_order?: number;
          id?: number;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_category_company_id_fkey";
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
          price_per_unit: number | null;
          product_id: number;
          quantity: number;
        };
        Insert: {
          created_at?: string;
          id?: number;
          inventory_id: number;
          price_per_unit?: number | null;
          product_id: number;
          quantity: number;
        };
        Update: {
          created_at?: string;
          id?: number;
          inventory_id?: number;
          price_per_unit?: number | null;
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
            foreignKeyName: "product_record_inventory_id_fkey";
            columns: ["inventory_id"];
            referencedRelation: "low_quantity_notifications_user_id_view";
            referencedColumns: ["inventory_id"];
          },
          {
            foreignKeyName: "product_record_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "product";
            referencedColumns: ["id"];
          }
        ];
      };
      recipe: {
        Row: {
          company_id: number | null;
          created_at: string;
          id: number;
          name: string | null;
        };
        Insert: {
          company_id?: number | null;
          created_at?: string;
          id?: number;
          name?: string | null;
        };
        Update: {
          company_id?: number | null;
          created_at?: string;
          id?: number;
          name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "company";
            referencedColumns: ["id"];
          }
        ];
      };
      recipe_part: {
        Row: {
          created_at: string;
          id: number;
          product_id: number;
          quantity: number;
          recipe_id: number;
        };
        Insert: {
          created_at?: string;
          id?: number;
          product_id: number;
          quantity: number;
          recipe_id: number;
        };
        Update: {
          created_at?: string;
          id?: number;
          product_id?: number;
          quantity?: number;
          recipe_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_part_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "product";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_part_recipe_id_fkey";
            columns: ["recipe_id"];
            referencedRelation: "recipe";
            referencedColumns: ["id"];
          }
        ];
      };
      worker: {
        Row: {
          company_id: number | null;
          created_at: string;
          email: string;
          id: string;
          is_admin: boolean;
          name: string | null;
        };
        Insert: {
          company_id?: number | null;
          created_at?: string;
          email?: string;
          id: string;
          is_admin?: boolean;
          name?: string | null;
        };
        Update: {
          company_id?: number | null;
          created_at?: string;
          email?: string;
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
      low_quantity_notifications_user_id_view: {
        Row: {
          inventory_id: number | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "worker_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      low_quantity_product_records_view: {
        Row: {
          company_id: number | null;
          inventory_id: number | null;
          name: string | null;
          notification_threshold: number | null;
          product_record_id: number | null;
          quantity: number | null;
          unit: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "company";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_record_inventory_id_fkey";
            columns: ["inventory_id"];
            referencedRelation: "inventory";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_record_inventory_id_fkey";
            columns: ["inventory_id"];
            referencedRelation: "low_quantity_notifications_user_id_view";
            referencedColumns: ["inventory_id"];
          }
        ];
      };
      record_view: {
        Row: {
          barcode: string | null;
          category_display_order: number | null;
          category_name: string | null;
          display_order: number | null;
          id: number | null;
          inventory_id: number | null;
          name: string | null;
          price_per_unit: number | null;
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
            foreignKeyName: "product_record_inventory_id_fkey";
            columns: ["inventory_id"];
            referencedRelation: "low_quantity_notifications_user_id_view";
            referencedColumns: ["inventory_id"];
          },
          {
            foreignKeyName: "product_record_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "product";
            referencedColumns: ["id"];
          }
        ];
      };
      worker_for_current_user: {
        Row: {
          company_id: number | null;
          created_at: string | null;
          email: string | null;
          id: string | null;
          is_admin: boolean | null;
          name: string | null;
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
          price_per_unit: number | null;
          product_id: number;
          quantity: number;
        };
      };
      assign_new_worker_to_company: {
        Args: {
          new_company_id: number;
          worker_email: string;
        };
        Returns: string;
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
          is_delivery: boolean;
          last_product_record_updated_at: string | null;
          low_quantity_notification_sent: boolean | null;
          name: string;
        }[];
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
          is_delivery: boolean;
          last_product_record_updated_at: string | null;
          low_quantity_notification_sent: boolean | null;
          name: string;
        };
      };
      send_low_quantity_notification: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
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
          owner_id: string | null;
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
          owner_id?: string | null;
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
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
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
          owner_id: string | null;
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
          owner_id?: string | null;
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
          owner_id?: string | null;
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
