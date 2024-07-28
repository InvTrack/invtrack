export type AliasForm = {
  productAliases: {
    // key is stringified product_id
    // value is a list of alias strings
    [product_id: string]: string[] | null; //alias
  };
  recipeAliases: {
    // key is stringified recipe_id
    // value is a list of alias strings
    [recipe_id: string]: string[] | null; //alias
  };
  usedAliases: string[];
};
