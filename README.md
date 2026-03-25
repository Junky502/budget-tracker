# Welcome to your Lovable project

TODO: Document your project here

## Database Setup

This app uses Supabase for data persistence. The following tables are required:

- `incomes` - Partner income sources
- `expenses` - Expense records
- `settings` - App settings (partner names)
- `categories` - Budget categories (customizable)

### Creating the Categories Table

If the categories table doesn't exist in your Supabase database, run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  recommended NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (category, label, icon, recommended) VALUES
  ('housing', 'Housing', '🏠', 30),
  ('utilities', 'Utilities', '💡', 5),
  ('groceries', 'Groceries', '🛒', 10),
  ('dining-out', 'Dining Out', '🍽️', 5),
  ('entertainment', 'Entertainment', '🎬', 5),
  ('transportation', 'Transport', '🚗', 10),
  ('healthcare', 'Healthcare', '🏥', 5),
  ('insurance', 'Insurance', '🛡️', 5),
  ('personal-care', 'Personal Care', '💆', 3),
  ('clothing', 'Clothing', '👕', 3),
  ('education', 'Education', '📚', 3),
  ('subscriptions', 'Subscriptions', '📱', 3),
  ('savings', 'Savings', '🏦', 10),
  ('gifts', 'Gifts', '🎁', 2),
  ('pets', 'Pets', '🐾', 2),
  ('home-maintenance', 'Home', '🔧', 3),
  ('discretionary', 'Discretionary', '✨', 5);
```

### Startup Behavior

The app now treats Supabase as the required source of truth on startup:

- It does not auto-seed sample or default records from the client.
- Empty tables stay empty.
- If startup loading fails, the UI shows sentinel records (`Salary 404` and `SUPABASE`) so failures are visible immediately.
