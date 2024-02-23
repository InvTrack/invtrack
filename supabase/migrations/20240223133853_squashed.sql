
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

ALTER SCHEMA "public" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."product_record" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "quantity" numeric NOT NULL,
    "product_id" bigint NOT NULL,
    "inventory_id" bigint NOT NULL
);

ALTER TABLE "public"."product_record" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."add_next_product_record"("product_record_id" bigint, "new_inventory_id" bigint) RETURNS "public"."product_record"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  declare old_record product_record;
  begin
    -- should limit 1 be added here?
    select * into old_record from product_record
    where product_record.id = product_record_id;
    
    insert into product_record(quantity, product_id, inventory_id)
    values(old_record.quantity, old_record.product_id, new_inventory_id);

    return old_record;
  end;
$$;

ALTER FUNCTION "public"."add_next_product_record"("product_record_id" bigint, "new_inventory_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."assign_new_worker_to_company"("new_company_id" bigint, "worker_email" "text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  worker_id uuid;
BEGIN
  UPDATE worker AS w
  SET company_id = new_company_id
  WHERE w.email = worker_email AND w.company_id IS NULL
  RETURNING w.id INTO worker_id;

  RETURN worker_id;
END;
$$;

ALTER FUNCTION "public"."assign_new_worker_to_company"("new_company_id" bigint, "worker_email" "text") OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."inventory" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "date" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "company_id" bigint,
    "last_product_record_updated_at" timestamp with time zone,
    "low_quantity_notification_sent" boolean DEFAULT false,
    "is_delivery" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."inventory" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_previous_inventory"("inventory_id" bigint) RETURNS SETOF "public"."inventory"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."get_previous_inventory"("inventory_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_previous_product_record_quantity"("current_inventory_id" bigint, "current_product_id" bigint) RETURNS numeric
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."get_previous_product_record_quantity"("current_inventory_id" bigint, "current_product_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_delete_inventory"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  delete from public.product_record where inventory_id = old.id;
  return old;
end;
$$;

ALTER FUNCTION "public"."handle_delete_inventory"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_inventory"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."handle_new_inventory"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_inventory_func"("new_date" timestamp without time zone, "inventory_id" bigint) RETURNS "public"."inventory"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  declare
    last_inventory inventory;
    new_inventory inventory;
    r record;
  begin
    select * into last_inventory from inventory
      where inventory.date < new_date
      order by inventory.date desc limit 1;

    insert into inventory(name, date, user_id)
    values('sdf', new_date, last_inventory.user_id)
    returning * into new_inventory;
    
    for r in select * from product_record
      where product_record.inventory_id = last_inventory.id
      loop
        perform add_next_product_record(r.id, new_inventory.id);
        -- perform add_next_product_record(r.id, inventory_id);
      end loop;
    return new_inventory;
  end;
$$;

ALTER FUNCTION "public"."handle_new_inventory_func"("new_date" timestamp without time zone, "inventory_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.worker (id, company_id, name, email)
  values (new.id,
    -- inserting company_id here has caused a "An invalid response was received from the upstream server" error in the past,
    -- but it fixed itself mysteriously. Watch out!
    CASE 
      WHEN new.raw_user_meta_data->>'company_id' IS NOT NULL THEN (new.raw_user_meta_data->>'company_id')::bigint
      ELSE NULL
    END,
    new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."notification_debounce_product_record_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE inventory
    SET last_product_record_updated_at = now()
    WHERE id = NEW.inventory_id;
    
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."notification_debounce_product_record_update"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."send_low_quantity_notification"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    token TEXT;
    project_url TEXT;
BEGIN
    SELECT decrypted_secret INTO token
    FROM vault.decrypted_secrets 
    WHERE name ='service_role_key';

    SELECT decrypted_secret INTO project_url
    FROM vault.decrypted_secrets 
    WHERE name ='project_url';

    PERFORM net.http_post(
        url:=project_url || '/functions/v1/send-low-quantity-notification',
        headers:=format('{"Content-Type": "application/json", "Authorization": "Bearer %s"}', token)::jsonb,
        body:='{}'::jsonb
    ) as request_id;
END;
$$;

ALTER FUNCTION "public"."send_low_quantity_notification"() OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."barcode" (
    "code" "text" NOT NULL,
    "company_id" bigint NOT NULL,
    "product_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."barcode" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."company" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" DEFAULT ''::"text" NOT NULL
);

ALTER TABLE "public"."company" OWNER TO "postgres";

ALTER TABLE "public"."company" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."company_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."worker" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" DEFAULT ''''''::"text",
    "company_id" bigint,
    "is_admin" boolean DEFAULT false NOT NULL,
    "email" "text" DEFAULT ''::"text" NOT NULL
);

ALTER TABLE "public"."worker" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."current_company_id" AS
 SELECT "worker"."company_id" AS "id"
   FROM "public"."worker"
  WHERE ("worker"."id" = "auth"."uid"());

ALTER TABLE "public"."current_company_id" OWNER TO "postgres";

ALTER TABLE "public"."inventory" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."inventories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."product" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "unit" "text" DEFAULT ''::"text" NOT NULL,
    "steps" numeric[] DEFAULT '{1,5,10}'::numeric[] NOT NULL,
    "company_id" bigint,
    "notification_threshold" numeric DEFAULT 0 NOT NULL
);

ALTER TABLE "public"."product" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."low_quantity_product_records_view" WITH ("security_invoker"='true') AS
 SELECT "ranked_records"."name",
    "ranked_records"."notification_threshold",
    "ranked_records"."quantity",
    "ranked_records"."company_id",
    "ranked_records"."inventory_id",
    "ranked_records"."id" AS "product_record_id",
    "ranked_records"."unit"
   FROM ( SELECT "product"."name",
            "product"."notification_threshold",
            "product"."unit",
            "product"."company_id",
            "product_record"."quantity",
            "product_record"."inventory_id",
            "product_record"."id",
            "row_number"() OVER (PARTITION BY "product_record"."product_id" ORDER BY "inventory"."date" DESC) AS "row_num"
           FROM (("public"."product_record"
             LEFT JOIN "public"."product" ON (("product_record"."product_id" = "product"."id")))
             JOIN "public"."inventory" ON (("product_record"."inventory_id" = "inventory"."id")))) "ranked_records"
  WHERE (("ranked_records"."row_num" = 1) AND ("ranked_records"."quantity" <= "ranked_records"."notification_threshold"));

ALTER TABLE "public"."low_quantity_product_records_view" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."low_quantity_notifications_user_id_view" WITH ("security_invoker"='true') AS
 SELECT DISTINCT "worker"."id" AS "user_id",
    "inventory"."id" AS "inventory_id"
   FROM (("public"."worker"
     JOIN "public"."low_quantity_product_records_view" ON (("worker"."company_id" = "low_quantity_product_records_view"."company_id")))
     JOIN "public"."inventory" ON (("inventory"."id" = "low_quantity_product_records_view"."inventory_id")))
  WHERE (("worker"."is_admin" = true) AND ("inventory"."low_quantity_notification_sent" = false) AND ("inventory"."last_product_record_updated_at" < ("now"() - '00:15:00'::interval)));

ALTER TABLE "public"."low_quantity_notifications_user_id_view" OWNER TO "postgres";

ALTER TABLE "public"."product_record" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."product_quantity_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE "public"."product" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."products_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE OR REPLACE VIEW "public"."record_view" AS
 SELECT "product"."name",
    "product"."unit",
    "product"."steps",
    "product_record"."quantity",
    "product_record"."inventory_id",
    "product_record"."id",
    "product_record"."product_id",
    "barcode"."code" AS "barcode"
   FROM (("public"."product_record"
     LEFT JOIN "public"."product" ON (("product_record"."product_id" = "product"."id")))
     LEFT JOIN "public"."barcode" ON (("product_record"."product_id" = "barcode"."product_id")));

ALTER TABLE "public"."record_view" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."worker_for_current_user" AS
 SELECT "worker"."id",
    "worker"."created_at",
    "worker"."name",
    "worker"."company_id",
    "worker"."is_admin",
    "worker"."email"
   FROM "public"."worker"
  WHERE ("worker"."id" = "auth"."uid"())
 LIMIT 1;

ALTER TABLE "public"."worker_for_current_user" OWNER TO "postgres";

ALTER TABLE ONLY "public"."barcode"
    ADD CONSTRAINT "barcode_pkey" PRIMARY KEY ("code", "company_id");

ALTER TABLE ONLY "public"."company"
    ADD CONSTRAINT "company_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventories_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."product_record"
    ADD CONSTRAINT "product_quantity_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."product"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."worker"
    ADD CONSTRAINT "worker_pkey" PRIMARY KEY ("id");

CREATE OR REPLACE TRIGGER "before_inventory_deleted" BEFORE DELETE ON "public"."inventory" FOR EACH ROW EXECUTE FUNCTION "public"."handle_delete_inventory"();

CREATE OR REPLACE TRIGGER "notification_debounce_product_record_update_trigger" AFTER UPDATE ON "public"."product_record" FOR EACH ROW EXECUTE FUNCTION "public"."notification_debounce_product_record_update"();

CREATE OR REPLACE TRIGGER "on_inventory_created" AFTER INSERT ON "public"."inventory" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_inventory"();

CREATE OR REPLACE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();

ALTER TABLE ONLY "public"."barcode"
    ADD CONSTRAINT "barcode_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."barcode"
    ADD CONSTRAINT "barcode_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."product"
    ADD CONSTRAINT "product_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."product_record"
    ADD CONSTRAINT "product_record_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id");

ALTER TABLE ONLY "public"."product_record"
    ADD CONSTRAINT "product_record_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id");

ALTER TABLE ONLY "public"."worker"
    ADD CONSTRAINT "worker_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."worker"
    ADD CONSTRAINT "worker_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

CREATE POLICY "Admins can add products" ON "public"."product" FOR INSERT WITH CHECK ((( SELECT "worker_for_current_user"."is_admin"
   FROM "public"."worker_for_current_user") AND ( SELECT ("worker_for_current_user"."company_id" = "product"."company_id")
   FROM "public"."worker_for_current_user")));

CREATE POLICY "Admins can assign unassigned workers" ON "public"."worker" FOR UPDATE TO "authenticated" USING ((("company_id" IS NULL) AND (( SELECT "worker_for_current_user"."is_admin"
   FROM "public"."worker_for_current_user") = true))) WITH CHECK (("company_id" = ( SELECT "current_company_id"."id"
   FROM "public"."current_company_id")));

CREATE POLICY "Admins can update workers within company" ON "public"."worker" FOR UPDATE TO "authenticated" USING (((( SELECT "worker_for_current_user"."company_id"
   FROM "public"."worker_for_current_user") = "company_id") AND (( SELECT "worker_for_current_user"."is_admin"
   FROM "public"."worker_for_current_user") = true))) WITH CHECK (true);

CREATE POLICY "Admins can view all unassigned workers" ON "public"."worker" FOR SELECT USING ((("company_id" IS NULL) AND (( SELECT "worker_for_current_user"."is_admin"
   FROM "public"."worker_for_current_user") = true)));

CREATE POLICY "Allow authenticated to access their companies' barcodes" ON "public"."barcode" USING ((EXISTS ( SELECT 1
   FROM "public"."worker" "w"
  WHERE (("w"."id" = "auth"."uid"()) AND ("w"."company_id" = "barcode"."company_id")))));

CREATE POLICY "Product policy" ON "public"."product" USING ((EXISTS ( SELECT 1
   FROM "public"."worker" "w"
  WHERE (("w"."id" = "auth"."uid"()) AND ("w"."company_id" = "product"."company_id")))));

CREATE POLICY "Workers can do whatever, within company" ON "public"."inventory" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."worker" "w"
  WHERE (("w"."company_id" = "inventory"."company_id") AND ("w"."id" = "auth"."uid"())))));

CREATE POLICY "Workers can do whatever, within company" ON "public"."product_record" USING ((EXISTS ( SELECT 1
   FROM "public"."inventory" "i"
  WHERE (("i"."company_id" = ( SELECT "current_company_id"."id"
           FROM "public"."current_company_id")) AND ("i"."id" = "product_record"."inventory_id")))));

CREATE POLICY "Workers can view their own company" ON "public"."company" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."worker" "w"
  WHERE (("w"."company_id" = "company"."id") AND ("w"."id" = "auth"."uid"())))));

CREATE POLICY "Workers can view workers within their company" ON "public"."worker" FOR SELECT USING (("company_id" = ( SELECT "current_company_id"."id"
   FROM "public"."current_company_id")));

ALTER TABLE "public"."barcode" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."company" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."inventory" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."product" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."product_record" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."worker" ENABLE ROW LEVEL SECURITY;

SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON TABLE "public"."product_record" TO "anon";
GRANT ALL ON TABLE "public"."product_record" TO "authenticated";
GRANT ALL ON TABLE "public"."product_record" TO "service_role";

GRANT ALL ON FUNCTION "public"."add_next_product_record"("product_record_id" bigint, "new_inventory_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."add_next_product_record"("product_record_id" bigint, "new_inventory_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_next_product_record"("product_record_id" bigint, "new_inventory_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."assign_new_worker_to_company"("new_company_id" bigint, "worker_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."assign_new_worker_to_company"("new_company_id" bigint, "worker_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_new_worker_to_company"("new_company_id" bigint, "worker_email" "text") TO "service_role";

GRANT ALL ON TABLE "public"."inventory" TO "anon";
GRANT ALL ON TABLE "public"."inventory" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory" TO "service_role";

GRANT ALL ON FUNCTION "public"."get_previous_inventory"("inventory_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_previous_inventory"("inventory_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_previous_inventory"("inventory_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_previous_product_record_quantity"("current_inventory_id" bigint, "current_product_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_previous_product_record_quantity"("current_inventory_id" bigint, "current_product_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_previous_product_record_quantity"("current_inventory_id" bigint, "current_product_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_delete_inventory"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_delete_inventory"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_delete_inventory"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_inventory"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_inventory"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_inventory"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_inventory_func"("new_date" timestamp without time zone, "inventory_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_inventory_func"("new_date" timestamp without time zone, "inventory_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_inventory_func"("new_date" timestamp without time zone, "inventory_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."notification_debounce_product_record_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."notification_debounce_product_record_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notification_debounce_product_record_update"() TO "service_role";

GRANT ALL ON FUNCTION "public"."send_low_quantity_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."send_low_quantity_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_low_quantity_notification"() TO "service_role";

SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;

SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;

GRANT ALL ON TABLE "public"."barcode" TO "anon";
GRANT ALL ON TABLE "public"."barcode" TO "authenticated";
GRANT ALL ON TABLE "public"."barcode" TO "service_role";

GRANT ALL ON TABLE "public"."company" TO "anon";
GRANT ALL ON TABLE "public"."company" TO "authenticated";
GRANT ALL ON TABLE "public"."company" TO "service_role";

GRANT ALL ON SEQUENCE "public"."company_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."worker" TO "anon";
GRANT ALL ON TABLE "public"."worker" TO "authenticated";
GRANT ALL ON TABLE "public"."worker" TO "service_role";

GRANT ALL ON TABLE "public"."current_company_id" TO "anon";
GRANT ALL ON TABLE "public"."current_company_id" TO "authenticated";
GRANT ALL ON TABLE "public"."current_company_id" TO "service_role";

GRANT ALL ON SEQUENCE "public"."inventories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."inventories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."inventories_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."product" TO "anon";
GRANT ALL ON TABLE "public"."product" TO "authenticated";
GRANT ALL ON TABLE "public"."product" TO "service_role";

GRANT ALL ON TABLE "public"."low_quantity_product_records_view" TO "anon";
GRANT ALL ON TABLE "public"."low_quantity_product_records_view" TO "authenticated";
GRANT ALL ON TABLE "public"."low_quantity_product_records_view" TO "service_role";

GRANT ALL ON TABLE "public"."low_quantity_notifications_user_id_view" TO "anon";
GRANT ALL ON TABLE "public"."low_quantity_notifications_user_id_view" TO "authenticated";
GRANT ALL ON TABLE "public"."low_quantity_notifications_user_id_view" TO "service_role";

GRANT ALL ON SEQUENCE "public"."product_quantity_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_quantity_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_quantity_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."record_view" TO "anon";
GRANT ALL ON TABLE "public"."record_view" TO "authenticated";
GRANT ALL ON TABLE "public"."record_view" TO "service_role";

GRANT ALL ON TABLE "public"."worker_for_current_user" TO "anon";
GRANT ALL ON TABLE "public"."worker_for_current_user" TO "authenticated";
GRANT ALL ON TABLE "public"."worker_for_current_user" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
