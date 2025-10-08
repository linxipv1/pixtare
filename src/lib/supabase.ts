import { createClient } from '@supabase/supabase-js';

// Production Supabase Configuration - rbezqujczgetsoaehfrh.supabase.co
const supabaseUrl = 'https://rbezqujczgetsoaehfrh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZXpxdWpjemdldHNvYWVoZnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDk0NzYsImV4cCI6MjA3NDU4NTQ3Nn0.Eb4SVbUMN34qSaWTZP1eLMxpqLqs2DuozydwMP6Vp3Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
