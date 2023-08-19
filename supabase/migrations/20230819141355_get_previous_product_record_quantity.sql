
CREATE OR REPLACE FUNCTION public.get_previous_inventory(inventory_id bigint)
RETURNS SETOF inventory AS $$
DECLARE
    current_inventory inventory;
    previous_inventory inventory;
BEGIN
    SELECT * INTO current_inventory FROM inventory WHERE id = inventory_id;

    RETURN QUERY
    SELECT * FROM inventory 
    WHERE created_at < (SELECT created_at FROM inventory WHERE id = current_inventory.id)
    ORDER BY created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_previous_product_record_quantity(current_inventory_id bigint, current_product_id bigint)
RETURNS numeric AS $$
DECLARE
    previous_quantity numeric;
    prev_inventory_id bigint;
BEGIN
    SELECT id INTO prev_inventory_id FROM public.get_previous_inventory(current_inventory_id);

    SELECT quantity INTO previous_quantity
    FROM product_record
    WHERE product_record.product_id = current_product_id AND product_record.inventory_id = prev_inventory_id;

    RETURN previous_quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

create or replace view
  public.record_view as
select
  product.name,
  product.unit,
  product.steps,
  product_record.quantity,
  product_record.inventory_id,
  product_record.id,
  product_record.product_id
from
  product_record
  left join product on product_record.product_id = product.id;