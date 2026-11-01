/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://saanmura-demo.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.demo-anon-key';

export const isLiveSupabaseConfigured = Boolean(
  import.meta.env?.VITE_SUPABASE_URL && 
  import.meta.env?.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env?.VITE_SUPABASE_URL.includes('demo')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
