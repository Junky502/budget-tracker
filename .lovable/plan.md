

## Plan: Connect External Supabase for Persistent Storage

### What you need to do first
You'll need a Supabase project. If you don't have one yet, create a free one at [supabase.com](https://supabase.com). You'll need two values from your project's Settings > API page:
- **Project URL** (e.g. `https://xxxxx.supabase.co`)
- **Anon public key** (safe to store in code)

### Step 1: Connect Supabase
We'll use Lovable's Supabase connector to link your external Supabase project. This gives us the client library and credentials.

### Step 2: Create database tables
Three tables in Supabase:
- **incomes** — `id`, `partner`, `source`, `amount`, `recurring`, `created_at`
- **expenses** — `id`, `category`, `description`, `amount`, `date`, `paid_by`, `shared`, `created_at`
- **settings** — `id`, `key`, `value` (for partner names)

No auth for now — simple open tables (you can add auth later).

### Step 3: Update BudgetContext
Replace localStorage persistence with Supabase reads/writes:
- On mount: fetch incomes, expenses, and partner names from Supabase
- `addIncome` / `removeIncome`: write to Supabase + update local state
- `addExpense` / `removeExpense`: write to Supabase + update local state
- `setPartnerNames`: upsert into settings table
- Add loading state for initial data fetch

### Step 4: Install Supabase client
Add `@supabase/supabase-js` and create a `src/lib/supabase.ts` client file with URL and anon key.

### Summary
- Data persists in a real database accessible from any device
- No authentication required initially (can be added later)
- Local state still used for instant UI updates, synced to Supabase

