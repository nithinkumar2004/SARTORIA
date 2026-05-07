-- Supabase SQL migration for Sartoria Seller / The Forge

create extension if not exists "pgcrypto";

-- Profiles table links a seller to Supabase Auth
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id),
  company_name text,
  saturn_tier text,
  created_at timestamptz not null default now()
);

-- Products table for AI garment reconstruction jobs
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id),
  name text not null,
  category text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz not null default now()
);

-- Assets table stores raw images and the resulting GLB URL
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  raw_image_front_url text,
  raw_image_back_url text,
  model_3d_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable row level security and protect seller data
alter table profiles enable row level security;
create policy "profiles owner only" on profiles
  for select using (auth.uid() = user_id);
create policy "profiles owner insert" on profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles owner update" on profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table products enable row level security;
create policy "products owner only" on products
  for select using (seller_id = auth.uid());
create policy "products owner insert" on products
  for insert with check (seller_id = auth.uid());
create policy "products owner update" on products
  for update using (seller_id = auth.uid()) with check (seller_id = auth.uid());

alter table assets enable row level security;
create policy "assets owner only" on assets
  for select using (
    exists (
      select 1 from products p where p.id = assets.product_id and p.seller_id = auth.uid()
    )
  );
create policy "assets owner insert" on assets
  for insert with check (
    exists (
      select 1 from products p where p.id = assets.product_id and p.seller_id = auth.uid()
    )
  );
create policy "assets owner update" on assets
  for update using (
    exists (
      select 1 from products p where p.id = assets.product_id and p.seller_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from products p where p.id = assets.product_id and p.seller_id = auth.uid()
    )
  );
