create table "public"."barcode" (
    "code" text not null,
    "company_id" bigint not null,
    "product_id" bigint,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."barcode" enable row level security;

CREATE POLICY "Allow authenticated to access their companies' barcodes" ON "public"."barcode" USING ((EXISTS ( SELECT 1
   FROM "public"."worker" "w"
  WHERE (("w"."id" = "auth"."uid"()) AND ("w"."company_id" = "barcode"."company_id")))));


CREATE UNIQUE INDEX barcode_pkey ON public.barcode USING btree (code, company_id);

alter table "public"."barcode" add constraint "barcode_pkey" PRIMARY KEY using index "barcode_pkey";

alter table "public"."barcode" add constraint "barcode_company_id_fkey" FOREIGN KEY (company_id) REFERENCES company(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."barcode" validate constraint "barcode_company_id_fkey";

alter table "public"."barcode" add constraint "barcode_product_id_fkey" FOREIGN KEY (product_id) REFERENCES product(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."barcode" validate constraint "barcode_product_id_fkey";

create or replace view
  public.record_view as
select
  product.name,
  product.unit,
  product.steps,
  product_record.quantity,
  product_record.inventory_id,
  product_record.id,
  product_record.product_id,
  barcode.code as barcode
from
  product_record
  left join product on product_record.product_id = product.id
  left join barcode on product_record.product_id = barcode.product_id;
