import { createClient } from "@supabase/supabase-js";
let _c: ReturnType<typeof createClient> | null = null;
export function getSupabaseClient() {
  if (_c) return _c;
  const url = import.meta.env.VITE_SUPABASE_URL!;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY!;
  _c = createClient(url, key);
  return _c;
}