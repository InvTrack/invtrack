create table "public"."recipe_record" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "quantity" numeric not null,
    "recipe_id" bigint not null,
    "inventory_id" bigint not null,
    "company_id" bigint not null
);

alter table "public"."recipe_record" enable row level security;

CREATE UNIQUE INDEX recipe_record_pkey ON public.recipe_record USING btree (id);

alter table "public"."recipe_record" add constraint "recipe_record_pkey" PRIMARY KEY using index "recipe_record_pkey";

alter table "public"."recipe_record" add constraint "recipe_record_inventory_id_fkey" FOREIGN KEY (inventory_id) REFERENCES inventory(id) not valid;

alter table "public"."recipe_record" validate constraint "recipe_record_inventory_id_fkey";

alter table "public"."recipe_record" add constraint "recipe_record_recipe_id_fkey" FOREIGN KEY (recipe_id) REFERENCES recipe(id) not valid;

alter table "public"."recipe_record" validate constraint "recipe_record_recipe_id_fkey";

alter table "public"."recipe_record" add constraint "recipe_record_company_id_fkey" FOREIGN KEY (company_id) REFERENCES company(id) not valid;

alter table "public"."recipe_record" validate constraint "recipe_record_company_id_fkey";

insert into recipe_record (inventory_id, recipe_id, company_id, quantity)
   (select i.id as inventory_id, r.id as recipe_id, r.company_id, 0 as quantity 
    from inventory i 
    join recipe r on r.company_id = i.company_id 
    order by i.id asc);

create policy "Admin can do anything within company"
on "public"."recipe_record"
as permissive
for all
to authenticated
using ((( SELECT worker_for_current_user.is_admin
   FROM worker_for_current_user) AND ( SELECT (worker_for_current_user.company_id = recipe_record.company_id)
   FROM worker_for_current_user)));


CREATE POLICY "Non-admin can select on recipe_record, within company"
ON "public"."recipe_record"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  (SELECT (worker_for_current_user.company_id = recipe_record.company_id)
   FROM worker_for_current_user)
);

CREATE POLICY "Non-admin can insert on recipe_record, within company"
ON "public"."recipe_record"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT (worker_for_current_user.company_id = recipe_record.company_id)
   FROM worker_for_current_user)
);

CREATE POLICY "Non-admin can update on recipe_record, within company"
ON "public"."recipe_record"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  (SELECT (worker_for_current_user.company_id = recipe_record.company_id)
   FROM worker_for_current_user)
);

GRANT ALL PRIVILEGES ON TABLE "public"."recipe_record" TO "authenticated";
GRANT ALL PRIVILEGES ON TABLE "public"."recipe_record" TO "service_role";