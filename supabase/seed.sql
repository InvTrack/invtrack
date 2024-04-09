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
    ('Spody do pizzy', 1, 1);

insert into public.product (name, unit, category_id, company_id, display_order) values
    ('Salami Ventricina',       'kg',    1,    1, 0), 
    ('Mąka Semola Rimacinata',  'worki', 1,    1, 1), 
    ('Krem Truflowy 3%-sos',    'kg',    2,    1, 0), 
    ('SPIANATA Pikantna',       'kg',    2,    1, 1), 
    ('Łyżeczki', 'szt.', NULL, 1, 0),
    ('Cukier',   'kg',   NULL, 1, 1);


-- Inwentaryzacje
insert into public.inventory (name, date, company_id, is_delivery)
    values
      ('Inwentaryzacja 02-07',  '2023-02-07 00:00:00+00', 1, false),
      ('Dostawa 02-07',         '2023-02-07 00:00:00+00', 1, true),
      ('Inwentaryzacja 02-08',  '2023-02-08 00:00:00+00', 1, false),
      ('Dostawa 02-08',         '2023-02-08 00:00:00+00', 1, true),
      ('Inwentaryzacja 02-09',  '2023-02-09 00:00:00+00', 1, false),
      ('Dostawa 02-09',         '2023-02-09 00:00:00+00', 1, true),
      ('Inwentaryzacja 02-10',  '2023-02-10 00:00:00+00', 1, false),
      ('Dostawa 02-10',         '2023-02-10 00:00:00+00', 1, true),
      ('Inwentaryzacja 02-11',  '2023-02-11 00:00:00+00', 1, false),
      ('Dostawa 02-11',         '2023-02-11 00:00:00+00', 1, true);

update public.product_record set price_per_unit = 19.0 where product_id = 1;
update public.product_record set price_per_unit = 20.4 where id = 8;
update public.product_record set price_per_unit = 21.0 where id = 15;
update public.product_record set price_per_unit = 20.1 where id = 22;

update public.product_record set quantity = 13.69 where product_id = 1;
update public.product_record set quantity = 33.4 where id = 8;
update public.product_record set quantity = 53.0 where id = 15;
update public.product_record set quantity = 3.1 where id = 22;

-- Recepty
insert into public.recipe (name, company_id)
    values 
      ('Sałatka mięsowa', 1),
      ('Spaghetti', 1);

insert into public.recipe_part (quantity, recipe_id, product_id)
    values 
      (0.2, 1, 1),
      (0.3, 1, 4),
      (0.8, 2, 2),
      (0.8, 2, 5);