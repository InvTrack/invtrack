CREATE OR REPLACE FUNCTION send_low_quantity_notification() RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql;