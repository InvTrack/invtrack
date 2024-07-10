
INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '6a3ec7ce-ad5e-4bfd-956a-21c775eaf38f', 'authenticated', 'authenticated', 'adam@example.com', '$2a$10$Pr7iIWcpeJWTUm6np037h.cI6YsMjNIPx/mn7eWgbq67NjmHUo6n2', '2024-07-08 09:57:35.651714+00', NULL, '', NULL, '', NULL, '', '', NULL, '2024-07-10 10:07:05.948454+00', '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-07-08 09:57:35.621166+00', '2024-07-10 10:07:05.949718+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);



INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('6a3ec7ce-ad5e-4bfd-956a-21c775eaf38f', '6a3ec7ce-ad5e-4bfd-956a-21c775eaf38f', '{"sub": "6a3ec7ce-ad5e-4bfd-956a-21c775eaf38f", "email": "adam@example.com", "email_verified": false, "phone_verified": false}', 'email', '2024-07-08 09:57:35.63829+00', '2024-07-08 09:57:35.638352+00', '2024-07-08 09:57:35.638352+00', '2ba4124c-733a-43da-b83a-3c582d9cdbea');



INSERT INTO "public"."company" ("id", "created_at", "name") VALUES
	(2, '2024-03-11 17:02:20.408101+00', 'Testowa prodowa');


INSERT INTO "public"."product_category" ("id", "created_at", "name", "company_id", "display_order") VALUES
	(1, '2024-07-01 20:26:52.249813+00', 'Cukiernicze', 2, 0),
	(2, '2024-03-14 12:01:06.956423+00', 'Owoce', 2, 3);

INSERT INTO "public"."product" ("id", "created_at", "name", "unit", "steps", "company_id", "notification_threshold", "category_id", "display_order", "deleted_at") VALUES
	(1, '2024-07-01 20:05:04.709484+00', 'Gofry Emix', 'Szt', '{1,5,10}', 2, 0, 1, 0, NULL),
	(2, '2024-07-01 20:05:19.27241+00', 'Śmietana', 'szt.', '{1,5,10}', 2, 0, 1, 0, NULL),
	(3, '2024-07-01 20:09:01.6365+00', 'Ananas', 'szt.', '{1,5,10}', 2, 0, 2, 0, NULL),
	(4, '2024-07-01 20:10:26.720252+00', 'Nutella', 'szt.', '{1,5,10}', 2, 0, 1, 0, NULL),
	(5, '2024-07-01 20:10:26.720252+00', 'Sos Czekoladowy', 'szt.', '{1,5,10}', 2, 0, 1, 0, NULL),
	(6, '2024-07-01 20:10:26.720252+00', 'Maliny w żelu', 'szt.', '{1,5,10}', 2, 0, 2, 0, NULL),
	(7, '2024-07-01 20:10:26.720252+00', 'Olej rzepakowy', 'szt.', '{1,5,10}', 2, 0, NULL, 0, NULL);

INSERT INTO "public"."inventory" ("id", "created_at", "name", "date", "company_id", "last_product_record_updated_at", "low_quantity_notification_sent", "is_delivery") VALUES
	(1, '2024-07-03 14:35:53.232275+00', '3 lipiec', '2024-07-03 14:35:47+00', 2, '2024-07-10 10:20:11.885395+00', false, true);

DELETE FROM "public"."product_record" WHERE id = 3;
DELETE FROM "public"."product_record" WHERE id = 4;

INSERT INTO "public"."recipe" ("id", "created_at", "name", "company_id") VALUES
	(1, '2024-04-18 15:12:53.215491+00', 'Pizza Salami Pikante', 2);

INSERT INTO "public"."name_alias" ("id", "alias", "recipe_id", "product_id", "company_id") VALUES
	(1, 'Gofry Emix 5kg', NULL, 1, 2),
	(2, 'Deserowa UHT Bieruńska 33% 5 lit.', NULL, 2, 2),
	(3, 'Ananas Kostka Sandra 565g', NULL, 3, 2),
	(4, 'Nutella 825 g', NULL, 4, 2);

RESET ALL;

update public.worker set name = 'Adam', company_id = 2, is_admin = true where id = '6a3ec7ce-ad5e-4bfd-956a-21c775eaf38f';