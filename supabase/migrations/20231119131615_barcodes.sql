create table "public"."barcode" (
    "code" text not null,
    "company_id" bigint not null,
    "product_id" bigint,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."barcode" enable row level security;

CREATE UNIQUE INDEX barcode_pkey ON public.barcode USING btree (code, company_id);

alter table "public"."barcode" add constraint "barcode_pkey" PRIMARY KEY using index "barcode_pkey";

alter table "public"."barcode" add constraint "barcode_company_id_fkey" FOREIGN KEY (company_id) REFERENCES company(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."barcode" validate constraint "barcode_company_id_fkey";

alter table "public"."barcode" add constraint "barcode_product_id_fkey" FOREIGN KEY (product_id) REFERENCES product(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."barcode" validate constraint "barcode_product_id_fkey";

-- ALTER TABLE "public"."product"
-- ADD COLUMN "barcodes" text[] DEFAULT '{}'::text[] NOT NULL;

-- CREATE
-- OR REPLACE FUNCTION insert_barcode (product_id INT, new_barcode TEXT) RETURNS TABLE (updated_product_id INT, updated_barcodes TEXT[]) AS $$
-- DECLARE
--   company_id_val INT;
-- BEGIN
--   SELECT company_id INTO company_id_val FROM "public"."product" WHERE id = product_id;

--   IF EXISTS (
--     SELECT 1
--     FROM "public"."product"
--     WHERE company_id = company_id_val
--     AND new_barcode = ANY (barcodes)
--   ) THEN
--     RAISE EXCEPTION 'Duplicate barcode found: %', new_barcode;
--   END IF;

--   UPDATE product
--   SET barcodes = barcodes || new_barcode
--   WHERE id = product_id
--   AND company_id = company_id_val
--   RETURNING id, barcodes INTO updated_product_id, updated_barcodes;

--   RETURN NEXT;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE
-- OR REPLACE FUNCTION delete_barcode (product_id INT, barcode_to_delete TEXT) RETURNS TABLE (updated_product_id INT, updated_barcodes TEXT[]) AS $$
-- DECLARE
--   company_id_val INT;
-- BEGIN
--   SELECT company_id INTO company_id_val FROM "public"."product" WHERE id = product_id;

--   UPDATE product
--   SET barcodes = array_remove(barcodes, barcode_to_delete)
--   WHERE id = product_id
--   AND company_id = company_id_val
--   RETURNING id, barcodes INTO updated_product_id, updated_barcodes;

--   RETURN NEXT;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE
-- OR REPLACE FUNCTION update_barcode (
--   product_id INT,
--   old_barcode TEXT,
--   new_barcode TEXT
-- ) RETURNS TABLE (updated_product_id INT, updated_barcodes TEXT[]) AS $$
-- DECLARE
--   company_id_val INT;
-- BEGIN
--   SELECT company_id INTO company_id_val FROM "public"."product" WHERE id = product_id;

--   IF EXISTS (
--     SELECT 1
--     FROM "public"."product"
--     WHERE company_id = company_id_val
--     AND new_barcode = ANY (barcodes)
--   ) THEN
--     RAISE EXCEPTION 'Duplicate barcode found: %', new_barcode;
--   END IF;

--   UPDATE product
--   SET barcodes = array_replace(barcodes, old_barcode, new_barcode)
--   WHERE id = product_id
--   AND company_id = company_id_val
--   RETURNING id, barcodes INTO updated_product_id, updated_barcodes;

--   RETURN NEXT;
-- END;
-- $$ LANGUAGE plpgsql;