import { createClient } from "@supabase/supabase-js";
import { API_KEYS } from "@/config";

const supabaseUrl = API_KEYS.supabase.url;
const supabaseKey = API_KEYS.supabase.publishableKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
