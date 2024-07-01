import { Database } from "./generated";

/**
 * Inwentaryzacja - zbiór "wpisów" o tym ile jakiego rodzaju towaru posiadało przedsiębiorstwo w danym czasie
 */
export type Inventory = InventoryTable["Row"];
export type InventoryInsert = InventoryTable["Insert"];
export type InventoryTable = Database["public"]["Tables"]["inventory"];

/**
 * Jeden "wpis" danego produktu w inwentaryzacji. Jedna informacja o tym "ile" i "jakiego" produktu. Np. "produkt #462 - 5kg"
 */
export type ProductRecord = ProductRecordTable["Row"];
export type ProductRecordInsert = ProductRecordTable["Insert"];
export type ProductRecordTable = Database["public"]["Tables"]["product_record"];

/**
 * Widok wpisu - wpis poszerzony o kilka wygodnych informacji, np o jednostkę obliczeniową i nazwę słowną produktu
 */
export type ProductRecordView = ProductRecordViewTable["Row"];
export type ProductRecordViewTable = Database["public"]["Views"]["record_view"];

/**
 * Abstrakcyjny typ produktu - zbiór cech wspólnych. np: "nazwa: Jabłko, jednostka: Sztuki"
 */
export type Product = ProductTable["Row"];
export type ProductTable = Database["public"]["Tables"]["product"];

/**
 * Pracownik. Zwykły, albo z rolą "administrator". Szef też jest pracownikiem i zazwyczaj będzie miał rolę administrator.
 * Administrator może na przykład dodawać nowych pracowników
 */
export type Worker = WorkerTable["Row"];
export type WorkerTable = Database["public"]["Tables"]["worker"];

/**
 * Przedsiębiorstwo / firma. To do niej przypisane są wszystkie inne zasoby i to wg przyależności do niej ustalany jest dostęp do zasobów.
 * Np. pracownik może edytować inwentaryzacje tylko w obrębie firmy do której należy.
 */
export type Company = CompanyTable["Row"];
export type CompanyTable = Database["public"]["Tables"]["company"];

export type CurrentCompanyId = CurrentCompanyIdTable["Row"];
export type CurrentCompanyIdTable =
  Database["public"]["Views"]["current_company_id"];

export type NameAlias = Database["public"]["Tables"]["name_alias"];
export type NameAliasTable = NameAlias["Row"];
export type NameAliasInsert = NameAlias["Insert"];

// Patch the database to remove excessive nullability from "existing_products" and "deleted_products"
export type PatchedDatabase = {
  [A in keyof Database]: A extends "public"
    ? {
        [B in keyof Database[A]]: B extends "Views"
          ? {
              [C in keyof Database[A][B]]: C extends
                | "existing_products"
                | "deleted_products"
                ? Database["public"]["Tables"]["product"]
                : Database[A][B][C];
            }
          : Database[A][B];
      }
    : Database[A];
};

export type ProcessInvoiceResponse = {
  form: {
    [recordId: number]: {
      product_id: number;
      price_per_unit: number;
      quantity: number;
    };
  };
  unmatched: {
    [name: string]: {
      price_per_unit: number;
      quantity: number;
    };
  };
  unmatchedAliases: string[];
} | null;

export type ProcessSalesRaportResponse = {
  form: {
    [recipe_id: string]: {
      quantity: number;
    };
  };
  unmatchedAliases: string[];
} | null;
