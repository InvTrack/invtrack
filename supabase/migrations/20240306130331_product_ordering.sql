

create table "public"."product_category" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "company_id" bigint,
    "display_order" integer not null default 0
);


alter table "public"."product_category" enable row level security;

alter table "public"."product" add column "category" bigint;

alter table "public"."product" add column "display_order" integer not null default 0;

CREATE UNIQUE INDEX product_category_pkey ON public.product_category USING btree (id);

alter table "public"."product_category" add constraint "product_category_pkey" PRIMARY KEY using index "product_category_pkey";

alter table "public"."product" add constraint "product_category_fkey" FOREIGN KEY (category) REFERENCES product_category(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."product" validate constraint "product_category_fkey";

alter table "public"."product_category" add constraint "product_category_company_id_fkey" FOREIGN KEY (company_id) REFERENCES company(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."product_category" validate constraint "product_category_company_id_fkey";

create policy "Admin can do anything within company"
on "public"."product_category"
as permissive
for all
to public
using ((( SELECT worker_for_current_user.is_admin
   FROM worker_for_current_user) AND ( SELECT (worker_for_current_user.company_id = product_category.company_id)
   FROM worker_for_current_user)));

CREATE OR REPLACE VIEW "public"."record_view" WITH ("security_invoker"='true') AS
SELECT "product"."name",
    "product"."unit",
    "product"."steps",
    "product_record"."quantity",
    "product_record"."inventory_id",
    "product_record"."id",
    "product_record"."product_id",
    "barcode"."code" as "barcode",
    "product_category"."name" as "category_name",
    "product_category"."display_order" as "category_display_order",
    "product"."display_order"
FROM ("public"."product_record"
LEFT JOIN "public"."product" ON ("product_record"."product_id" = "product"."id")
LEFT JOIN "public"."barcode" ON ("product_record"."product_id" = "barcode"."product_id")
LEFT JOIN "public"."product_category" ON ("product"."category" = "product_category"."id"));