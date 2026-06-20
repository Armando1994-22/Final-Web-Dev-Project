import { createClient } from "@supabase/supabase-js";

// Make sure 'Url' vs 'URL' matches everywhere in this file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; 

// Pass the exact variables defined above
export const supabase = createClient(supabaseUrl, supabaseAnonKey);