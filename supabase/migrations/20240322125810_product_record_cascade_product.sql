alter table "public"."product_record" drop constraint "product_record_product_id_fkey";

alter table "public"."product_record" add constraint "product_record_product_id_fkey" FOREIGN KEY (product_id) REFERENCES product(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."product_record" validate constraint "product_record_product_id_fkey";
