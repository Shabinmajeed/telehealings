import { createClient } from '@supabase/supabase-js'

// Replace these with the values from your Supabase Dashboard 
// (Settings -> API)
// const supabaseUrl = 'https://orcqqsicbczkhowobokz.supabase.co'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yY3Fxc2ljYmN6a2hvd29ib2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTg1MDUsImV4cCI6MjA5MjMzNDUwNX0.RCjlLdLbFeTuIs0IfvlZ7DT-41KyRDZVPpTUuGsGwO8'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey)