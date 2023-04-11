import { Database } from "./generated";

/**
 * Użytkownik aplicaji, czyli pracownik albo szef
 */
export type User = UserTable["Row"];
export type UserTable = Database["public"]["Tables"]["user"];

/**
 * Inwentaryzacja - zbiór "wpisów" o tym ile jakiego rodzaju towaru posiadało przedsiębiorstwo w danym czasie
 */
export type Inventory = InventoryTable["Row"];
export type InventoryTable = Database["public"]["Tables"]["inventory"];

/**
 * Jeden "wpis" danego produktu w inwentaryzacji. Jedna informacja o tym "ile" i "jakiego" produktu. Np. "produkt #462 - 5kg"
 */
export type Record = RecordTable["Row"];
export type RecordTable = Database["public"]["Tables"]["product_record"];

/**
 * Widok wpisu - wpis poszerzony o kilka wygodnych informacji, np o jednostkę obliczeniową i nazwę słowną produktu
 */
export type RecordView = RecordViewTable["Row"];
export type RecordViewTable = Database["public"]["Views"]["record_view"];

/**
 * Abstrakcyjny typ produktu - zbiór cech wspólnych. np: "nazwa: Jabłko, jednostka: Sztuki"
 */
export type Product = ProductTable["Row"];
export type ProductTable = Database["public"]["Tables"]["product"];
