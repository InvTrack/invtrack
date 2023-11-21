ALTER TABLE "public"."product" ADD COLUMN "barcodes" text[] DEFAULT '{}'::text[] NOT NULL;

CREATE OR REPLACE FUNCTION check_unique_barcodes()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "public"."product" p
    WHERE p.company_id = NEW.company_id
      AND (
        (ARRAY(SELECT unnest(NEW.barcodes)) && ARRAY(SELECT unnest(p.barcodes))) OR
        (NEW.barcodes IS NULL AND p.barcodes IS NULL)
      )
  ) THEN
    RAISE EXCEPTION 'Barcode must be unique within the same company_id';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_duplicate_barcodes
BEFORE INSERT OR UPDATE ON "public"."product"
FOR EACH ROW EXECUTE FUNCTION check_unique_barcodes();