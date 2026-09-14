-- Extensões usadas pelo schema.
create extension if not exists "pgcrypto";  -- gen_random_uuid()
create extension if not exists "citext";    -- e-mail case-insensitive
