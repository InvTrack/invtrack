-- Restauracje
insert into public.company (name)
    values ('Pierogostacja'), ('Grôcznô Ryba'), ('Mięsny jeż');

-- Pracownicy
INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at")
    VALUES ('00000000-0000-0000-0000-000000000000', 'f4b8d51e-b172-4e3c-8253-c3db265d8181', 'authenticated', 'authenticated', 'adam@example.com', '$2a$10$U1mClCPshWee8v1pR6J2geYh9YHkfcXXXolyqAfKCxb271ApmgQqS', '2023-04-23 20:50:31.100985+00', NULL, '', '2023-04-23 20:50:15.18794+00', '', NULL, '', '', NULL, '2023-05-21 19:19:54.495517+00', '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-04-23 20:50:15.182281+00', '2023-05-22 15:29:13.870493+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);
INSERT INTO "auth"."identities" ("id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at") VALUES ('f4b8d51e-b172-4e3c-8253-c3db265d8181', 'f4b8d51e-b172-4e3c-8253-c3db265d8181', '{"sub": "f4b8d51e-b172-4e3c-8253-c3db265d8181", "email": "adam@example.com"}', 'email', '2023-04-23 20:50:15.186106+00', '2023-04-23 20:50:15.186143+00', '2023-04-23 20:50:15.186143+00');
update public.worker set name = 'Adam', company_id = 1 where id = 'f4b8d51e-b172-4e3c-8253-c3db265d8181';


-- Inwentaryzacje
insert into public.product (name, unit, company_id)
    values ('Łyżeczki', 'szt.', 1), ('Szynka', 'kg', 1);

insert into public.inventory (name, date, company_id)
    values ('Testowa Inwentaryzacja 1', '2023-02-02 00:00:00+00', 1), ('Testowa Inwentaryzacja 2', '2023-02-03 00:00:00+00', 1);

insert into public.product_record (inventory_id, product_id, quantity) values 
    (1, 1, 23),
    (2, 1, 16),
    (1, 2, 4.3),
    (2, 2, 4.8);