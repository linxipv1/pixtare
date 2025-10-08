import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rbezqujczgetsoaehfrh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZXpxdWpjemdldHNvYWVoZnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDk0NzYsImV4cCI6MjA3NDU4NTQ3Nn0.Eb4SVbUMN34qSaWTZP1eLMxpqLqs2DuozydwMP6Vp3Q';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL:', supabaseUrl);
  console.error('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');
  throw new Error('Missing Supabase environment variables. Please restart the dev server.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
