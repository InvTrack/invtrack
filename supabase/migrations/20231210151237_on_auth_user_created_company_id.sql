CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;