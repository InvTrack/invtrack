CREATE POLICY "Worker can select on product_category within company"
ON "public"."product_category"
AS PERMISSIVE
for SELECT
TO authenticated
USING (
  ( SELECT (worker_for_current_user.company_id = product_category.company_id)
   FROM worker_for_current_user)
);


CREATE POLICY "Worker can select on recipe within company"
ON "public"."recipe"
AS PERMISSIVE
for SELECT
TO authenticated
USING (
  ( SELECT (worker_for_current_user.company_id = recipe.company_id)
   FROM worker_for_current_user)
);
