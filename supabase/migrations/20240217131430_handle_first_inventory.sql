CREATE OR REPLACE FUNCTION public.handle_new_inventory()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  declare
    last_inventory inventory;
    r record;
    p product;
  begin
    select * into last_inventory from public.inventory
      where inventory.date < new.date
      order by inventory.date desc 
      limit 1;

    IF NOT FOUND THEN
        for p in select * from public.product
        where true
        loop
          insert into product_record(quantity, product_id, inventory_id)
          values(0, p.id, new.id);
        end loop;

        return new;
    ELSE
        for r in select * from public.product_record
        where product_record.inventory_id = last_inventory.id
        loop
          perform add_next_product_record(r.id, new.id);
        end loop;
    
        return new;
    END IF;
  end;
$function$
;