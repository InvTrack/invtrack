alter table "public"."product_record" add column "price_per_unit" numeric;

drop view "public"."record_view";
create view
  public.record_view as
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