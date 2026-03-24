import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdwmyujethvkcoebigaq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkd215dWpldGh2a2NvZWJpZ2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTQ1NzQsImV4cCI6MjA4OTkzMDU3NH0.hERxr6Vp3HM0-bTRfFLmSiX2fUT30gncCl7p6ZCZC7s';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
