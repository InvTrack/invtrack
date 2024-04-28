export type AliasForm = {
  // stringified product_id
  [product_id: string]: string[] | null; //alias
} & { usedAliases: string[] };
