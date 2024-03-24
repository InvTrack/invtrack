drop function if exists "public"."handle_new_inventory_func"(new_date timestamp without time zone, inventory_id bigint);

alter table "public"."product" add column "deleted_at" timestamp with time zone;

CREATE VIEW public.existing_products AS
SELECT * FROM public.product
WHERE deleted_at IS NULL;

CREATE VIEW public.deleted_products AS
SELECT * FROM public.product
WHERE deleted_at IS NOT NULL;

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
        for p in select * from public.existing_products
        where true
        loop
          insert into product_record(quantity, product_id, inventory_id)
          values(0, p.id, new.id);
        end loop;

        return new;
    ELSE
        for r in select pr.* from public.product_record pr
        join public.product prod on pr.product_id = prod.id
        where pr.inventory_id = last_inventory.id
          and prod.deleted_at is NULL
        loop
          perform add_next_product_record(r.id, new.id);
        end loop;
    
        return new;
    END IF;
  end;
$function$
;