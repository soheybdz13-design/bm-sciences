import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gzqlgmnjdubuooiupyyr.supabase.co";

const supabaseKey =
  "sb_publishable_OnZSBPWL5LbBM_tWv0pubw_u6rxw9Kt";

export const supabase = createClient(supabaseUrl, supabaseKey);