alter table "public"."worker" add column "email" text not null default ''::text;

-- email will now be available in the worker table
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.worker (id, name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.assign_new_worker_to_company(new_company_id bigint, worker_email text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  worker_id uuid;
BEGIN
  UPDATE worker AS w
  SET company_id = new_company_id
  WHERE w.email = worker_email AND w.company_id IS NULL
  RETURNING w.id INTO worker_id;

  RETURN worker_id;
END;
$function$
;

CREATE OR REPLACE VIEW worker_for_current_user AS
    (SELECT *
      FROM worker
      WHERE id = auth.uid());


create policy "Admins can update unassigned workers"
on "public"."worker"
as permissive
for update
to authenticated
using (((company_id IS NULL) AND (( SELECT worker_for_current_user.is_admin
   FROM worker_for_current_user) = true)))
with check ((company_id = ( SELECT current_company_id.id
   FROM current_company_id)));


create policy "Admins can view all unassigned workers"
on "public"."worker"
as permissive
for select
to public
using (((company_id IS NULL) AND (( SELECT worker_for_current_user.is_admin
   FROM worker_for_current_user) = true)));
