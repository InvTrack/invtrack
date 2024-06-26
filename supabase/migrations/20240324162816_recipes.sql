create table "public"."recipe" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "company_id" bigint
);


alter table "public"."recipe" enable row level security;

create table "public"."recipe_part" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "quantity" numeric not null,
    "product_id" bigint not null,
    "recipe_id" bigint not null
);


alter table "public"."recipe_part" enable row level security;

CREATE UNIQUE INDEX recipe_part_pkey ON public.recipe_part USING btree (id);

CREATE UNIQUE INDEX recipe_pkey ON public.recipe USING btree (id);

alter table "public"."recipe" add constraint "recipe_pkey" PRIMARY KEY using index "recipe_pkey";

alter table "public"."recipe_part" add constraint "recipe_part_pkey" PRIMARY KEY using index "recipe_part_pkey";

alter table "public"."recipe" add constraint "recipe_company_id_fkey" FOREIGN KEY (company_id) REFERENCES company(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."recipe" validate constraint "recipe_company_id_fkey";

alter table "public"."recipe_part" add constraint "recipe_part_product_id_fkey" FOREIGN KEY (product_id) REFERENCES product(id) not valid;

alter table "public"."recipe_part" validate constraint "recipe_part_product_id_fkey";

alter table "public"."recipe_part" add constraint "recipe_part_recipe_id_fkey" FOREIGN KEY (recipe_id) REFERENCES recipe(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."recipe_part" validate constraint "recipe_part_recipe_id_fkey";



create policy "Admin can do anything within company"
on "public"."recipe"
as permissive
for all
to authenticated
using ((( SELECT worker_for_current_user.is_admin
   FROM worker_for_current_user) AND ( SELECT (worker_for_current_user.company_id = recipe.company_id)
   FROM worker_for_current_user)));


CREATE POLICY "Admin can do whatever, within company"
ON public.recipe_part 
as permissive
for all
to authenticated
USING (( SELECT worker_for_current_user.is_admin
   FROM worker_for_current_user) AND (EXISTS ( SELECT 1 FROM public.recipe r WHERE (
        (r.company_id = ( SELECT current_company_id.id FROM public.current_company_id)) AND 
        (r.id = recipe_part.recipe_id)))));