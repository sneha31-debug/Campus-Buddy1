import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey ? "Loaded" : "Not loaded");

// Error checking
if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is not set");
}

if (!supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY is not set");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
