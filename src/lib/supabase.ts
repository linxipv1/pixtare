import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mjrkiroqyfwxbhzfofen.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcmtpcm9xeWZ3eGJoemZvZmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MjA0MzIsImV4cCI6MjA3NTM5NjQzMn0.5yFpEiEtuOL12rlLRt6NQ5BXFUXIlokEzpz4DZbc0Q0';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL:', supabaseUrl);
  console.error('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');
  throw new Error('Missing Supabase environment variables. Please restart the dev server.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
