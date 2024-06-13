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

CREATE OR REPLACE VIEW "public"."current_company_id" AS
 SELECT "worker"."company_id" AS "id"
   FROM "public"."worker"
  WHERE ("worker"."id" = "auth"."uid"());
