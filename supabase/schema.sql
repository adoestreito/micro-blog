create extension if not exists pgcrypto;

create table if not exists public.storage_items (
  id uuid primary key default gen_random_uuid(),
  item_name text not null check (length(trim(item_name)) > 0),
  quantity numeric not null default 1 check (quantity >= 0),
  description text,
  expiration_date date,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.storage_items enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists storage_items_set_updated_at on public.storage_items;

create trigger storage_items_set_updated_at
before update on public.storage_items
for each row
execute function public.set_updated_at();
