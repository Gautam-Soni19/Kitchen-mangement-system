-- Run in the Supabase SQL editor. Phone OTP must be enabled under Authentication > Providers.
create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_phone text not null,
  items jsonb not null,
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'New'
    check (status in ('New', 'Preparing', 'Ready', 'Completed', 'Cancelled'))
);

alter table public.customer_orders enable row level security;

-- Customers may submit an order only for the phone number in their verified Auth token.
create policy "verified customers can place orders"
  on public.customer_orders for insert to authenticated
  with check (customer_phone = (auth.jwt() ->> 'phone'));

-- Only trusted staff with app_metadata.role = admin can view and manage all orders.
create policy "admins can view orders"
  on public.customer_orders for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins can update orders"
  on public.customer_orders for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant usage on schema public to authenticated;
grant select, insert, update on public.customer_orders to authenticated;
