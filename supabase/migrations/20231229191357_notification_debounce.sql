/*
    It performs the following tasks:
    1. Adds two columns, last_product_record_updated_at and low_quantity_notification_sent, to the inventory table.
    2. Creates the pg_cron extension and grants necessary privileges.
    3. Defines a trigger function, notification_debounce_product_record_update, that updates the last_product_record_updated_at column in the inventory table.
    4. Creates a trigger, notification_debounce_product_record_update_trigger, that executes the notification_debounce_product_record_update function after an update on the product_record table.
    5. Sets up a cron job using the cron.schedule function to invoke the send-low-quantity-notification function every 15 minutes.
    6. Creates a view, low_quantity_notifications_user_id_view, that retrieves user IDs and inventory IDs for low quantity notifications based on certain conditions.
*/
ALTER TABLE inventory 
ADD COLUMN last_product_record_updated_at timestamp with time zone DEFAULT null;

ALTER TABLE inventory 
ADD COLUMN low_quantity_notification_sent boolean DEFAULT false;

CREATE EXTENSION pg_cron WITH SCHEMA extensions;

GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

CREATE OR REPLACE FUNCTION notification_debounce_product_record_update()
RETURNS trigger AS
$BODY$
BEGIN
    UPDATE inventory
    SET last_product_record_updated_at = now()
    WHERE id = NEW.inventory_id;
    
    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

CREATE TRIGGER notification_debounce_product_record_update_trigger
AFTER UPDATE ON product_record
FOR EACH ROW
EXECUTE PROCEDURE notification_debounce_product_record_update();

-- add the vault entry to every environment
CREATE OR REPLACE FUNCTION send_low_quantity_notification() RETURNS VOID AS $$
DECLARE
    token TEXT;
BEGIN
    SELECT decrypted_secret INTO token
    FROM vault.decrypted_secrets 
    WHERE name ='service_role_key';

    PERFORM net.http_post(
        url:='http://172.17.0.1:54321/functions/v1/send-low-quantity-notification', 
        headers:=format('{"Content-Type": "application/json", "Authorization": "Bearer %s"}', token)::jsonb,
        body:='{}'::jsonb
    ) as request_id;
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule(
    'call_edge_invoke_send_low_quantity_notification_test',
    '*/15 * * * *', 
    'SELECT send_low_quantity_notification()'
);

DROP VIEW IF EXISTS low_quantity_notifications_user_id_view;
CREATE VIEW low_quantity_notifications_user_id_view WITH (security_invoker) AS 
SELECT DISTINCT
    worker.id as user_id,
    inventory.id as inventory_id
FROM 
    "public"."worker"
JOIN 
    "public"."low_quantity_product_records_view" 
ON 
    "worker"."company_id" = "low_quantity_product_records_view"."company_id"
JOIN 
    "public"."inventory"
ON
    "inventory"."id" = "low_quantity_product_records_view"."inventory_id"
WHERE 
    "worker"."is_admin" = true 
    AND "inventory"."low_quantity_notification_sent" = false
    AND "inventory"."last_product_record_updated_at" < (NOW() - INTERVAL '15 minutes');
