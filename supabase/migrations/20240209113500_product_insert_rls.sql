create policy "Admins can add products"
on "public"."product"
as permissive
for insert
to public
with check ((( SELECT worker_for_current_user.is_admin
   FROM worker_for_current_user) AND ( SELECT (worker_for_current_user.company_id = product.company_id)
   FROM worker_for_current_user)));
