-- 점주 (먹깨비 입점 매장)
create table merchants (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  store_name text,
  phone text,
  invited_at timestamptz default now(),
  first_order_at timestamptz
);

-- 사조 SKU (관리자가 CSV로 업로드)
create table products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  unit text not null,
  price_krw integer not null,
  min_order_qty integer not null default 1,
  in_stock boolean not null default true,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 주문
create table orders (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id),
  status text not null default 'pending',
  delivery_date date not null,
  total_krw integer not null,
  notes text,
  created_at timestamptz default now(),
  routed_at timestamptz,
  routed_by text
);

-- 주문 항목
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  qty integer not null check (qty > 0),
  unit_price_krw integer not null
);

-- RLS
alter table merchants enable row level security;
alter table orders enable row level security;
create policy "merchants see own orders"
  on orders for select
  using (
    merchant_id = (select id from merchants where email = auth.email())
  );

alter table order_items enable row level security;
create policy "merchants see own order items"
  on order_items for select
  using (
    order_id in (
      select id from orders where merchant_id = (
        select id from merchants where email = auth.email()
      )
    )
  );

alter table products enable row level security;
create policy "authenticated users see products"
  on products for select
  to authenticated
  using (true);
