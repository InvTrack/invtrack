ALTER TABLE "public"."product"
ADD COLUMN "barcodes" text[] DEFAULT '{}'::text[] NOT NULL;

CREATE
OR REPLACE FUNCTION insert_barcode (product_id INT, new_barcode TEXT) RETURNS TABLE (updated_product_id INT, updated_barcodes TEXT[]) AS $$
DECLARE
  company_id_val INT;
BEGIN
  SELECT company_id INTO company_id_val FROM "public"."product" WHERE id = product_id;

  IF EXISTS (
    SELECT 1
    FROM "public"."product"
    WHERE company_id = company_id_val
    AND new_barcode = ANY (barcodes)
  ) THEN
    RAISE EXCEPTION 'Duplicate barcode found: %', new_barcode;
  END IF;

  UPDATE product
  SET barcodes = barcodes || new_barcode
  WHERE id = product_id
  AND company_id = company_id_val
  RETURNING id, barcodes INTO updated_product_id, updated_barcodes;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION delete_barcode (product_id INT, barcode_to_delete TEXT) RETURNS TABLE (updated_product_id INT, updated_barcodes TEXT[]) AS $$
DECLARE
  company_id_val INT;
BEGIN
  SELECT company_id INTO company_id_val FROM "public"."product" WHERE id = product_id;

  UPDATE product
  SET barcodes = array_remove(barcodes, barcode_to_delete)
  WHERE id = product_id
  AND company_id = company_id_val
  RETURNING id, barcodes INTO updated_product_id, updated_barcodes;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE FUNCTION update_barcode (
  product_id INT,
  old_barcode TEXT,
  new_barcode TEXT
) RETURNS TABLE (updated_product_id INT, updated_barcodes TEXT[]) AS $$
DECLARE
  company_id_val INT;
BEGIN
  SELECT company_id INTO company_id_val FROM "public"."product" WHERE id = product_id;

  IF EXISTS (
    SELECT 1
    FROM "public"."product"
    WHERE company_id = company_id_val
    AND new_barcode = ANY (barcodes)
  ) THEN
    RAISE EXCEPTION 'Duplicate barcode found: %', new_barcode;
  END IF;

  UPDATE product
  SET barcodes = array_replace(barcodes, old_barcode, new_barcode)
  WHERE id = product_id
  AND company_id = company_id_val
  RETURNING id, barcodes INTO updated_product_id, updated_barcodes;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;