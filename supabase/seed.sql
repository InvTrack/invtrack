-- Restauracje
insert into public.company (name)
    values ('Pierogostacja'), ('Grôcznô Ryba'), ('Mięsny jeż');

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at") VALUES
        ('00000000-0000-0000-0000-000000000000', 'c78156b4-052a-47de-bbd9-db3517a9406d', 'authenticated', 'authenticated', 'adam@example.com', '$2a$10$P9n7io9zuegzlNqbmG1GRe3zGUlDsV8EXEFQC2d7ZJ/B.2.1afBcy', '2024-03-06 12:48:13.948271+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-03-06 12:48:13.94456+00', '2024-03-06 12:48:13.948381+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL),
        ('00000000-0000-0000-0000-000000000000', 'eae6bf66-8828-4366-b7ba-5ab9bf3b0707', 'authenticated', 'authenticated', 'nowy@example.com', '$2a$10$JEG3Iosv8HtsGTXQEN0SS.Yso8zDRA/ccQO7w/Eah0FIkRWCNCVEa', '2024-03-06 12:48:28.386941+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-03-06 12:48:28.384754+00', '2024-03-06 12:48:28.387074+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
        ('c78156b4-052a-47de-bbd9-db3517a9406d', 'c78156b4-052a-47de-bbd9-db3517a9406d', '{"sub": "c78156b4-052a-47de-bbd9-db3517a9406d", "email": "adam@example.com", "email_verified": false, "phone_verified": false}', 'email', '2024-03-06 12:48:13.946592+00', '2024-03-06 12:48:13.946623+00', '2024-03-06 12:48:13.946623+00', 'c148dd52-80e0-48dc-a3db-55bb2e7412fa'),
        ('eae6bf66-8828-4366-b7ba-5ab9bf3b0707', 'eae6bf66-8828-4366-b7ba-5ab9bf3b0707', '{"sub": "eae6bf66-8828-4366-b7ba-5ab9bf3b0707", "email": "nowy@example.com", "email_verified": false, "phone_verified": false}', 'email', '2024-03-06 12:48:28.385693+00', '2024-03-06 12:48:28.385726+00', '2024-03-06 12:48:28.385726+00', '51a5d956-a7b4-43dc-b4d8-46b1ef6d4f4b');

update public.worker set name = 'Adam', company_id = 1, is_admin = true where id = 'c78156b4-052a-47de-bbd9-db3517a9406d';


insert into public.product_category (name, company_id, display_order) values 
    ('Mięsa', 1, 0), 
    ('Owoce', 1, 1);

insert into public.product (name, unit, category_id, company_id, display_order) values
    ('Szynka',   'kg',   1,    1, 0), 
    ('Kurczak',  'kg',   1,    1, 1), 
    ('Jabłka',   'kg',   2,    1, 0), 
    ('Banany',   'kg',   2,    1, 1), 
    ('Arbuzy',   'kg',   2,    1, 2), 
    ('Łyżeczki', 'szt.', NULL, 1, 0),
    ('Cukier',   'kg',   NULL, 1, 1);


-- Inwentaryzacje
insert into public.inventory (name, date, company_id)
    values 
      ('Testowa Inwentaryzacja 1',  '2023-02-02 00:00:00+00', 1),
      ('Testowa Inwentaryzacja 2',  '2023-02-03 00:00:00+00', 1),
      ('Testowa Inwentaryzacja 3',  '2023-02-04 00:00:00+00', 1),
      ('Testowa Inwentaryzacja 4',  '2023-02-05 00:00:00+00', 1),
      ('Testowa Inwentaryzacja 5',  '2023-02-06 00:00:00+00', 1),
      ('Testowa Inwentaryzacja 6',  '2023-02-07 00:00:00+00', 1),
      ('Testowa Inwentaryzacja 7',  '2023-02-08 00:00:00+00', 1),
      ('Testowa Inwentaryzacja 8',  '2023-02-09 00:00:00+00', 1),
      ('Testowa Inwentaryzacja 9',  '2023-02-10 00:00:00+00', 1),
      ('Testowa Inwentaryzacja 10', '2023-02-11 00:00:00+00', 1);

update public.product_record set price_per_unit = 19.0 where product_id = 1;
update public.product_record set price_per_unit = 20.4 where id = 8;
update public.product_record set price_per_unit = 21.0 where id = 15;
update public.product_record set price_per_unit = 20.1 where id = 22;

-- insert into public.product_record (inventory_id, product_id, quantity) values 
--     (1, 1, 5),
--     (1, 2, 31.0),
--     (1, 3, 30.5),
--     (1, 4, 58.5),
--     (2, 1, 20),
--     (2, 2, 32.5),
--     (2, 3, 22.6),
--     (2, 4, 87.7),
--     (3, 1, 84),
--     (3, 2, 3.95),
--     (3, 3, 23.0),
--     (3, 4, 34.7),
--     (4, 1, 47),
--     (4, 2, 22.7),
--     (4, 3, 76.2),
--     (4, 4, 19.2),
--     (5, 1, 31),
--     (5, 2, 33.3),
--     (5, 3, 51.3),
--     (5, 4, 34.4),
--     (6, 1, 50),
--     (6, 2, 16.6),
--     (6, 3, 80.2),
--     (6, 4, 60.0),
--     (7, 1, 27),
--     (7, 2, 12.1),
--     (7, 3, 19.1),
--     (7, 4, 16.6),
--     (8, 1, 31),
--     (8, 2, 89.1),
--     (8, 3, 6.43),
--     (8, 4, 26.5),
--     (9, 1, 64),
--     (9, 2, 79.1),
--     (9, 3, 62.2),
--     (9, 4, 31.0),
--     (10, 1, 61),
--     (10, 2, 11.5),
--     (10, 3, 57.6),
--     (10, 4, 28.3); 