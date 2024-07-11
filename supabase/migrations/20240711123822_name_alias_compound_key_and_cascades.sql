-- replace id with a coumpound key on alias and company id in name_alias table
drop index if exists "public"."name_alias_id_key";

alter table "public"."name_alias" drop column "id";

CREATE UNIQUE INDEX name_alias_pkey ON public.name_alias USING btree (alias, company_id);

alter table "public"."name_alias" add constraint "name_alias_pkey" PRIMARY KEY using index "name_alias_pkey";


-- add cascades where appropriate
alter table "public"."inventory" drop constraint "inventory_company_id_fkey";
alter table "public"."inventory" add constraint "public_inventory_company_id_fkey" FOREIGN KEY (company_id) REFERENCES company(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."inventory" validate constraint "public_inventory_company_id_fkey";

alter table "public"."product" drop constraint "product_company_id_fkey";
alter table "public"."product" add constraint "public_product_company_id_fkey" FOREIGN KEY (company_id) REFERENCES company(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."product" validate constraint "public_product_company_id_fkey";

alter table "public"."product_record" drop constraint "product_record_inventory_id_fkey";
alter table "public"."product_record" add constraint "public_product_record_inventory_id_fkey" FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."product_record" validate constraint "public_product_record_inventory_id_fkey";

alter table "public"."product_record" drop constraint "product_record_product_id_fkey";
alter table "public"."product_record" add constraint "public_product_record_product_id_fkey" FOREIGN KEY (product_id) REFERENCES product(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."product_record" validate constraint "public_product_record_product_id_fkey";

alter table "public"."recipe_part" drop constraint "recipe_part_product_id_fkey";
alter table "public"."recipe_part" add constraint "public_recipe_part_product_id_fkey" FOREIGN KEY (product_id) REFERENCES product(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."recipe_part" validate constraint "public_recipe_part_product_id_fkey";

alter table "public"."recipe_record" drop constraint "recipe_record_company_id_fkey";
alter table "public"."recipe_record" add constraint "public_recipe_record_company_id_fkey" FOREIGN KEY (company_id) REFERENCES company(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."recipe_record" validate constraint "public_recipe_record_company_id_fkey";

alter table "public"."recipe_record" drop constraint "recipe_record_inventory_id_fkey";
alter table "public"."recipe_record" add constraint "public_recipe_record_inventory_id_fkey" FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."recipe_record" validate constraint "public_recipe_record_inventory_id_fkey";

alter table "public"."recipe_record" drop constraint "recipe_record_recipe_id_fkey";
alter table "public"."recipe_record" add constraint "public_recipe_record_recipe_id_fkey" FOREIGN KEY (recipe_id) REFERENCES recipe(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."recipe_record" validate constraint "public_recipe_record_recipe_id_fkey";

alter table "public"."worker" drop constraint "worker_company_id_fkey";
alter table "public"."worker" add constraint "public_worker_company_id_fkey" FOREIGN KEY (company_id) REFERENCES company(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."worker" validate constraint "public_worker_company_id_fkey";

alter table "public"."worker" drop constraint "worker_id_fkey";
alter table "public"."worker" add constraint "public_worker_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."worker" validate constraint "public_worker_id_fkey";