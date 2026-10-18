# Étoile Kitchen & Table

Next.js restaurant portal with a public menu and phone verified checkout, plus a staff only kitchen dashboard. Customer ordering and staff authentication use Supabase Auth and Postgres. The existing inventory, analytics, and alerts screens remain demo data stored in the browser.

## Run locally

1. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key.
2. In Supabase, enable Phone Auth and configure an SMS provider and OTP policy.
3. Run `supabase/customer_orders.sql` in the Supabase SQL editor.
4. Create staff accounts in Supabase Auth, then assign `app_metadata.role = "admin"` using a trusted server-side admin tool. Never set admin role from the browser or put a service role key in this Next.js app.
5. Run `npm run dev` and open `http://localhost:3000`.

Customers browse at `/` without an account. Checkout sends an OTP to the submitted number, verifies it with Supabase Auth, and creates an order. Staff sign in at `/admin/login`; `/admin` and its customer order screen require the trusted `admin` app metadata claim. Database row level security is defined in the SQL file and remains the authority for reading and updating orders.

## Deploy to Vercel

Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Vercel project environment variables, configure the deployed site URL and SMS provider in Supabase Auth, then deploy the Next.js project. The Supabase anon key is designed for browser use; protect tables with row level security and keep service role keys server side.

## Current project boundary

The menu catalog is currently a small sample defined in `src/app/page.tsx`. Inventory, kitchen analytics, and system alert settings are still local demo screens; they are not persisted to Supabase yet. Customer orders are stored in Supabase and appear in the staff order view.
