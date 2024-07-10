
INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '6a3ec7ce-ad5e-4bfd-956a-21c775eaf38f', 'authenticated', 'authenticated', 'adam@example.com', '$2a$10$Pr7iIWcpeJWTUm6np037h.cI6YsMjNIPx/mn7eWgbq67NjmHUo6n2', '2024-07-08 09:57:35.651714+00', NULL, '', NULL, '', NULL, '', '', NULL, '2024-07-10 10:07:05.948454+00', '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-07-08 09:57:35.621166+00', '2024-07-10 10:07:05.949718+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);



INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('6a3ec7ce-ad5e-4bfd-956a-21c775eaf38f', '6a3ec7ce-ad5e-4bfd-956a-21c775eaf38f', '{"sub": "6a3ec7ce-ad5e-4bfd-956a-21c775eaf38f", "email": "adam@example.com", "email_verified": false, "phone_verified": false}', 'email', '2024-07-08 09:57:35.63829+00', '2024-07-08 09:57:35.638352+00', '2024-07-08 09:57:35.638352+00', '2ba4124c-733a-43da-b83a-3c582d9cdbea');



INSERT INTO "public"."company" ("id", "created_at", "name") VALUES
	(2, '2024-03-11 17:02:20.408101+00', 'Testowa prodowa');


INSERT INTO "public"."product_category" ("id", "created_at", "name", "company_id", "display_order") VALUES
	(14, '2024-07-01 20:26:52.249813+00', 'Owoce', 2, 0),
	(1, '2024-03-14 09:43:34.607298+00', 'Mięso', 2, 2),
	(4, '2024-03-14 12:01:06.956423+00', 'Napoje', 2, 3);

INSERT INTO "public"."product" ("id", "created_at", "name", "unit", "steps", "company_id", "notification_threshold", "category_id", "display_order", "deleted_at") VALUES
	(1, '2024-03-14 09:42:58.096235+00', 'Szynka', 'kg', '{1,5,10}', 2, 0, 1, 0, '2024-07-01 19:50:58.841+00'),
	(2, '2024-03-14 09:43:05.126072+00', 'antrykot', 'kg', '{1,5,10}', 2, 0, 1, 1, '2024-07-01 19:51:03.759+00'),
	(3, '2024-03-14 09:43:10.463037+00', 'dorsz', 'kg', '{1,5,10}', 2, 0, NULL, 0, '2024-07-01 19:50:40.371+00'),
	(4, '2024-03-14 09:43:14.739522+00', 'fladra', 'kg', '{1,5,10}', 2, 0, NULL, 1, '2024-07-01 19:50:45.605+00'),
	(5, '2024-03-14 11:58:51.547333+00', 'Pepsi', 'skrz.', '{1,5,10}', 2, 0, 4, 1, '2024-07-01 19:51:34.616+00'),
	(6, '2024-03-14 11:59:00.112976+00', 'Mirinda', 'szt.', '{1,5,10}', 2, 0, 4, 0, '2024-07-01 19:50:15.083+00'),
	(7, '2024-03-14 11:59:08.019779+00', '7up', 'zgrz.', '{1,5,10}', 2, 0, 4, 2, '2024-07-01 19:51:39.617+00'),
	(8, '2024-03-14 11:59:45.742927+00', 'Pilsner', 'szt.', '{1,5,24}', 2, 0, NULL, 0, '2024-07-01 19:50:35.903+00'),
	(9, '2024-03-14 12:00:14.474733+00', 'sok pomaranczowy', 'szt.', '{1,5,10}', 2, 0, 4, 3, '2024-07-01 19:51:44.15+00'),
	(10, '2024-03-19 10:23:13.614699+00', 'Prosciutto Crudo', 'kg', '{1,5,10}', 2, 0, NULL, 0, '2024-07-01 19:50:20.717+00'),
	(13, '2024-04-22 16:33:20.864363+00', 'SALAMI PIKANTE', 'kg', '{1,5,10}', 2, 0, NULL, 0, '2024-07-01 19:50:50.289+00'),
	(12, '2024-04-22 16:32:48.107685+00', 'SPINATA', 'kg', '{1,5,10}', 2, 0, NULL, 0, '2024-07-01 19:50:30.152+00'),
	(14, '2024-04-22 16:40:48.745131+00', 'mozarella', 'kg', '{1,5,10}', 2, 0, NULL, 0, '2024-07-01 19:50:54.374+00'),
	(15, '2024-04-22 16:41:23.811336+00', 'Papryka Jalapeno', 'kg', '{1,5,10}', 2, 0, NULL, 0, '2024-07-01 19:50:25.718+00'),
	(175, '2024-07-01 20:05:04.709484+00', 'Gofry Emix', 'Szt', '{1,5,10}', 2, 0, NULL, 0, NULL),
	(176, '2024-07-01 20:05:19.27241+00', 'Śmietana', 'szt.', '{1,5,10}', 2, 0, NULL, 0, NULL),
	(177, '2024-07-01 20:09:01.6365+00', 'Ananas', 'szt.', '{1,5,10}', 2, 0, NULL, 0, NULL),
	(178, '2024-07-01 20:10:26.720252+00', 'Nutella ', 'szt.', '{1,5,10}', 2, 0, NULL, 0, NULL),
	(179, '2024-07-01 20:14:01.564668+00', 'Antrykot', 'kg', '{1,5,10}', 2, 0, NULL, 0, NULL);


INSERT INTO "public"."inventory" ("id", "created_at", "name", "date", "company_id", "last_product_record_updated_at", "low_quantity_notification_sent", "is_delivery") VALUES
	(1, '2024-07-03 14:35:53.232275+00', '3 lipiec', '2024-07-03 14:35:47+00', 2, '2024-07-10 10:20:11.885395+00', false, true);


INSERT INTO "public"."recipe" ("id", "created_at", "name", "company_id") VALUES
	(1, '2024-04-18 15:12:53.215491+00', 'Pizza Salami Pikante', 2);


INSERT INTO "public"."name_alias" ("id", "alias", "recipe_id", "product_id", "company_id") VALUES
	(1, '|KROJONA 6-MIESIĘCZNA ATP 500G', NULL, 1, 2),
	(2, 'SPIANATA PIKANTNA VACUUM OK. 2.6KG', NULL, 12, 2),
	(3, 'SALAMI PIKANTNE VENTRICINA VACUUM OK. 3,2KG', NULL, 13, 2),
	(7, 'Gofry Emix 5kg', NULL, 175, 2),
	(8, 'Deserowa UHT Bieruńska 33% 5 lit.', NULL, 176, 2),
	(9, 'Deserowa UHT Bieruńska 33% 5 lit. Nutella 825 g', NULL, 176, 2),
	(10, 'Ananas Kostka Sandra 565g', NULL, 177, 2),
	(11, 'Gofry Emix 5kg', NULL, 175, 2),
	(12, 'Deserowa UHT Bieruńska 33% 5 lit.', NULL, 176, 2),
	(13, 'Ananas Kostka Sandra 565g', NULL, 177, 2),
	(14, 'Nutella 825 g', NULL, 178, 2),
	(15, 'Gofry Emix 5kg', NULL, 175, 2),
	(16, 'Deserowa UHT Bieruńska 33% 5 lit', NULL, 176, 2),
	(17, 'Ananas Kostka Sandra 565g', NULL, 177, 2),
	(18, 'Nutella 825 g', NULL, 178, 2),
	(19, 'Sos Czekoladowy Dijo 1kg', NULL, 179, 2);


-- INSERT INTO "public"."product_record" ("id", "created_at", "quantity", "product_id", "inventory_id", "price_per_unit") VALUES
-- 	(1, '2024-07-03 14:38:09.305644+00', 0, 175, 1, 44.44),
-- 	(2, '2024-07-03 14:38:09.305644+00', 0, 177, 1, 5.3),
-- 	(3, '2024-07-03 14:38:09.305644+00', 0, 178, 1, 21.85),
-- 	(4, '2024-07-03 14:38:09.305644+00', 0, 176, 1, 58.51);

RESET ALL;

update public.worker set name = 'Adam', company_id = 2, is_admin = true where id = '6a3ec7ce-ad5e-4bfd-956a-21c775eaf38f';