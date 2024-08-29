
INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '6a3ec7ce-ad5e-4bfd-956a-21c775eaf38f', 'authenticated', 'authenticated', 'adam@example.com', '$2a$10$Pr7iIWcpeJWTUm6np037h.cI6YsMjNIPx/mn7eWgbq67NjmHUo6n2', '2024-07-08 09:57:35.651714+00', NULL, '', NULL, '', NULL, '', '', NULL, '2024-07-10 10:07:05.948454+00', '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-07-08 09:57:35.621166+00', '2024-07-10 10:07:05.949718+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('6a3ec7ce-ad5e-4bfd-956a-21c775eaf38f', '6a3ec7ce-ad5e-4bfd-956a-21c775eaf38f', '{"sub": "6a3ec7ce-ad5e-4bfd-956a-21c775eaf38f", "email": "adam@example.com", "email_verified": false, "phone_verified": false}', 'email', '2024-07-08 09:57:35.63829+00', '2024-07-08 09:57:35.638352+00', '2024-07-08 09:57:35.638352+00', '2ba4124c-733a-43da-b83a-3c582d9cdbea');

INSERT INTO "public"."company" ("id", "name") VALUES
	(2, 'Testowa lokalna');

INSERT INTO "public"."product_category" ("id", "name", "company_id", "display_order") VALUES
	(1, 'Podstawowe',	2, 0),
	(2, 'Dodatki',   	2, 3);

INSERT INTO "public"."product" ("id", "name", "unit", "company_id", "notification_threshold", "category_id", "display_order", "deleted_at") VALUES
	(11, 'Mąka',            'kg.',  2, 0, 1,    0, NULL),
	(12, 'Jajka',           'szt.', 2, 0, 1,    0, NULL),
	(13, 'Mleko',           'szt.', 2, 0, 1,    0, NULL),
	(14, 'Nutella',         'szt.', 2, 0, 2,    0, NULL),
	(15, 'Truskawki',       'szt.', 2, 0, 2,    0, NULL),
	(16, 'Serwetki',        'szt.',	2, 0, NULL, 0, NULL);

-- INSERT INTO "public"."inventory" ("id", "name", "date", "company_id", "last_product_record_updated_at", "low_quantity_notification_sent", "is_delivery") VALUES
-- 	(1, '3 lipiec', '2024-07-03 14:35:47+00', 2, '2024-07-10 10:20:11.885395+00', false, true),
-- 	(2, '4 lipiec', '2024-07-04 14:35:47+00', 2, '2024-07-10 10:20:11.885395+00', false, false);

-- DELETE FROM "public"."product_record" WHERE product_id = 13;
-- DELETE FROM "public"."product_record" WHERE product_id = 14;

INSERT INTO "public"."recipe" ("id", "name", "company_id") VALUES
	(21, 'Naleśniki z Nutellą', 2),
	(22, 'Naleśniki z Truskawkami', 2),
	(23, 'Omlet', 2),
	(24, 'Kluski', 2);

INSERT INTO "public"."recipe_part" ("recipe_id", "product_id", "quantity") VALUES
	(21, 11, 1),
	(21, 12, 1),
	(21, 13, 1),
	(21, 14, 1),
	(22, 11, 1),
	(22, 12, 1),
	(22, 13, 1),
	(22, 15, 1),
	(23, 12, 1),
	(23, 13, 1),
	(24, 11, 1),
	(24, 12, 1);

INSERT INTO "public"."name_alias" ("alias", "recipe_id", "product_id", "company_id") VALUES
	('Mąka 1kg',			NULL,	11,		2),
	('NUTELLA 825 G',		NULL,	14,		2),
	('Naleśniki z Nutellą',	21, 	NULL, 	2),
	('Omlet',				23, 	NULL, 	2);

RESET ALL;

update public.worker set name = 'Adam', company_id = 2, is_admin = true where id = '6a3ec7ce-ad5e-4bfd-956a-21c775eaf38f';