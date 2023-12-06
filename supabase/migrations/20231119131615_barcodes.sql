ALTER TABLE "public"."product" ADD COLUMN "barcodes" text[] DEFAULT '{}'::text[] NOT NULL;

CREATE OR REPLACE FUNCTION public.check_unique_barcodes()
RETURNS TRIGGER AS $$
DECLARE
    new_barcode TEXT;
    existing_barcode TEXT;
BEGIN
    -- Loop through each barcode in the NEW.barcodes array
    FOREACH new_barcode IN ARRAY NEW.barcodes
    LOOP
        -- Check if the new barcode already exists in any other row with the same company_id
        IF EXISTS (SELECT 1 FROM public.product
                   WHERE company_id = NEW.company_id
                   AND new_barcode = ANY (barcodes)
                   AND NOT (id = NEW.id AND new_barcode = ANY(barcodes))) THEN
            RAISE EXCEPTION 'Barcode % already exists for the same company', new_barcode;
        END IF;
    END LOOP;

    -- Barcode is unique, allow the insert/update
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER prevent_duplicate_barcodes
BEFORE INSERT OR UPDATE OF barcodes ON "public"."product"
FOR EACH ROW EXECUTE FUNCTION check_unique_barcodes();

CREATE OR REPLACE FUNCTION insert_barcode(product_id INT, new_barcode TEXT) RETURNS TABLE (updated_product_id INT, updated_barcodes TEXT[]) AS
$$
BEGIN
  UPDATE product
  SET barcodes = barcodes || new_barcode
  WHERE id = product_id
  RETURNING id, barcodes INTO updated_product_id, updated_barcodes;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
