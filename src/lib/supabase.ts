import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // Ensure session persistence
    autoRefreshToken: true, // Ensure tokens refresh automatically
    detectSessionInUrl: true, // Necessary for OAuth flows
  },
});
