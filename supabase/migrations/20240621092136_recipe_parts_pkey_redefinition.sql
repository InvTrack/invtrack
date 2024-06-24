ALTER TABLE recipe_part DROP constraint recipe_part_pkey;
ALTER TABLE recipe_part ADD constraint recipe_part_pkey PRIMARY KEY (product_id,recipe_id);
ALTER TABLE recipe_part validate constraint recipe_part_product_id_fkey;
ALTER TABLE recipe_part validate constraint recipe_part_recipe_id_fkey;
ALTER TABLE recipe_part DROP COLUMN id;