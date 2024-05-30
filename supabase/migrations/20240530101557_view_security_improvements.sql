CREATE OR REPLACE VIEW "public"."worker_for_current_user" WITH ("security_invoker"='true') AS
 SELECT "worker"."id",
    "worker"."created_at",
    "worker"."name",
    "worker"."company_id",
    "worker"."is_admin",
    "worker"."email"
   FROM "public"."worker"
  WHERE ("worker"."id" = "auth"."uid"())
 LIMIT 1;

CREATE OR REPLACE VIEW "public"."current_company_id" WITH ("security_invoker"='true') AS
 SELECT "worker"."company_id" AS "id"
   FROM "public"."worker"
  WHERE ("worker"."id" = "auth"."uid"());

CREATE OR REPLACE VIEW public.existing_products WITH ("security_invoker"='true') AS
SELECT * FROM public.product
WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW public.deleted_products WITH ("security_invoker"='true') AS
SELECT * FROM public.product
WHERE deleted_at IS NOT NULL;

create or replace view
  public.record_view  with ("security_invoker"='true') as
select
  product.name,
  product.unit,
  product.steps,
  product_record.price_per_unit,
  product_record.quantity,
  product_record.inventory_id,
  product_record.id,
  product_record.product_id,
  barcode.code as barcode,
  product_category.name as category_name,
  product_category.display_order as category_display_order,
  product.display_order
from
  product_record
  left join product on product_record.product_id = product.id
  left join barcode on product_record.product_id = barcode.product_id
  left join product_category on product.category_id = product_category.id;