-- Restauracje
insert into public.company (name)
    values ('Pierogostacja'), ('Grôcznô Ryba'), ('Mięsny jeż');

-- Pracownicy
INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at")
    VALUES ('00000000-0000-0000-0000-000000000000', 'f4b8d51e-b172-4e3c-8253-c3db265d8181', 'authenticated', 'authenticated', 'adam@example.com', '$2a$10$U1mClCPshWee8v1pR6J2geYh9YHkfcXXXolyqAfKCxb271ApmgQqS', '2023-04-23 20:50:31.100985+00', NULL, '', '2023-04-23 20:50:15.18794+00', '', NULL, '', '', NULL, '2023-05-21 19:19:54.495517+00', '{"provider": "email", "providers": ["email"]}', '{"company_id":1,"full_name":"Adam"}', NULL, '2023-04-23 20:50:15.182281+00', '2023-05-22 15:29:13.870493+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);
INSERT INTO "auth"."identities" ("id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at") VALUES ('f4b8d51e-b172-4e3c-8253-c3db265d8181', 'f4b8d51e-b172-4e3c-8253-c3db265d8181', '{"sub": "f4b8d51e-b172-4e3c-8253-c3db265d8181", "email": "adam@example.com"}', 'email', '2023-04-23 20:50:15.186106+00', '2023-04-23 20:50:15.186143+00', '2023-04-23 20:50:15.186143+00');

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at")
    VALUES ('00000000-0000-0000-0000-000000000000', '95e0054b-712a-4fbc-b33b-ffbf3ae358c2', 'authenticated', 'authenticated', 'nowy@example.com', '$2a$10$U1mClCPshWee8v1pR6J2geYh9YHkfcXXXolyqAfKCxb271ApmgQqS', '2023-04-23 20:50:31.100985+00', NULL, '', '2023-04-23 20:50:15.18794+00', '', NULL, '', '', NULL, '2023-05-21 19:19:54.495517+00', '{"provider": "email", "providers": ["email"]}', '{"company_id":1}', NULL, '2023-04-23 20:50:15.182281+00', '2023-05-22 15:29:13.870493+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);
INSERT INTO "auth"."identities" ("id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at") VALUES ('95e0054b-712a-4fbc-b33b-ffbf3ae358c2', '95e0054b-712a-4fbc-b33b-ffbf3ae358c2', '{"sub": "95e0054b-712a-4fbc-b33b-ffbf3ae358c2", "email": "nowy@example.com"}', 'email', '2023-04-23 20:50:15.186106+00', '2023-04-23 20:50:15.186143+00', '2023-04-23 20:50:15.186143+00');


-- Inwentaryzacje
insert into public.product (name, unit, company_id)
    values ('Łyżeczki', 'szt.', 1), ('Szynka', 'kg', 1), ('Mąka', 'kg', 1), ('Cukier', 'kg', 1) ;

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

insert into public.product_record (inventory_id, product_id, quantity) values 
    (1, 1, 5),
    (1, 2, 31.0),
    (1, 3, 30.5),
    (1, 4, 58.5),
    (2, 1, 20),
    (2, 2, 32.5),
    (2, 3, 22.6),
    (2, 4, 87.7),
    (3, 1, 84),
    (3, 2, 3.95),
    (3, 3, 23.0),
    (3, 4, 34.7),
    (4, 1, 47),
    (4, 2, 22.7),
    (4, 3, 76.2),
    (4, 4, 19.2),
    (5, 1, 31),
    (5, 2, 33.3),
    (5, 3, 51.3),
    (5, 4, 34.4),
    (6, 1, 50),
    (6, 2, 16.6),
    (6, 3, 80.2),
    (6, 4, 60.0),
    (7, 1, 27),
    (7, 2, 12.1),
    (7, 3, 19.1),
    (7, 4, 16.6),
    (8, 1, 31),
    (8, 2, 89.1),
    (8, 3, 6.43),
    (8, 4, 26.5),
    (9, 1, 64),
    (9, 2, 79.1),
    (9, 3, 62.2),
    (9, 4, 31.0),
    (10, 1, 61),
    (10, 2, 11.5),
    (10, 3, 57.6),
    (10, 4, 28.3); 